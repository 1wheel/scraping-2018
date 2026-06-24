import xlrd, csv, statistics, json, os
from datetime import date, timedelta
from collections import defaultdict
import pyarrow as pa, pyarrow.parquet as pq
D='data/'
def pd(s): y,m,d=map(int,s.split('-')); return date(y,m,d)
def ymd(v):
    try:
        s=str(int(float(v))); return date(int(s[:4]),int(s[4:6]),int(s[6:8]))
    except: return None
def yr(d): return round(d.year+(d.timetuple().tm_yday-1)/365.25,3)
def norm(s):
    s=s.upper()
    for x in [' CORPORATION',' CORP',' COMPANY',' CO ',' CO.',' INCORPORATED',' INC',' LTD',' PLC',' & ',' AND ','/','-',',','.',"'"]: s=s.replace(x,' ')
    return ''.join(s.split())
CENSOR=date(1996,1,2); ASOF=date(2026,6,2); OG=date(1957,3,4); CHEN_END=date(2000,12,29)

# ---- Chen events per permno (+name, +ticker) ----
sh=xlrd.open_workbook(D+'changes/cns2004.xls').sheet_by_index(0)
chen_ev=defaultdict(list); perm_name={}; perm_tk={}
for r in range(48,sh.nrows):
    p=sh.cell_value(r,0); ef=ymd(sh.cell_value(r,2)); ty=sh.cell_value(r,3); nm=str(sh.cell_value(r,4)).strip(); tk=str(sh.cell_value(r,5)).strip()
    if ef is None: continue
    try: p=str(int(float(p))); ty=int(float(ty))
    except: continue
    chen_ev[p].append((ef, 1 if ty==0 else -1))
    if nm: perm_name[p]=nm
    if tk: perm_tk.setdefault(p,tk)
for p in chen_ev: chen_ev[p].sort()

# ---- fja spans ----
fja_spans=defaultdict(list); fja_universe=set()
for r in csv.DictReader(open(D+'ticker_start_end.csv')):
    s=pd(r['start_date']); e=pd(r['end_date']) if r['end_date'].strip() else None
    fja_spans[r['ticker']].append((s,e)); fja_universe.add(r['ticker'])

# ---- complete crosswalk: permno -> canonical fja ticker ----
perm2tk={}
if os.path.exists(D+'perm2ticker.json'):
    for pm,tk in json.load(open(D+'perm2ticker.json')).items(): perm2tk[pm]=tk
# direct Chen-ticker == fja-ticker, DATE-GUARDED: only fuse when the Chen firm was
# still present near the fja ticker's first appearance. Stops a long-departed firm
# being welded to a modern firm that reuses the symbol (McCrory 'MS' vs Morgan
# Stanley; Host Marriott 'MHS' vs Medco; old vs modern DAY/JEF/CTRA/HAR/CD...).
_fja_first={tk: min(s for s,e in sp) for tk,sp in fja_spans.items()}
def _chen_present_until(evs):
    cur=None; last_del=None
    for d,f in sorted(evs):
        if f==1: cur=d
        else: cur=None; last_del=d
    return CHEN_END if cur is not None else last_del   # still-in at 2000 -> CHEN_END; else last delete
for p,t in perm_tk.items():
    if t not in fja_universe: continue
    end=_chen_present_until(chen_ev.get(p,[]))
    if end is None or end >= _fja_first[t] - timedelta(days=1095):   # within ~3yr
        perm2tk.setdefault(p,t)
if os.path.exists(D+'crosswalk_resolved.csv'):    # the 66 resolved
    for r in csv.DictReader(open(D+'crosswalk_resolved.csv')):
        ft=(r.get('fja_ticker') or '').strip()
        if ft and ft!='unknown' and r.get('permno'): perm2tk.setdefault(r['permno'].strip(),ft)
# name match
name2tk={}
for f,nk,tk in [('changes/datahub_constituents.csv','Security','Symbol'),('changes/analyzingalpha_constituents.csv','name','ticker')]:
    for r in csv.DictReader(open(D+f)):
        if r.get(nk) and r.get(tk): name2tk.setdefault(norm(r[nk]),r[tk])
for p,nm in perm_name.items():
    if p not in perm2tk and norm(nm) in name2tk: perm2tk[p]=name2tk[norm(nm)]

# ---- recent ticker renames (workflow-classified): route old ticker -> final ----
renames={}
if os.path.exists(D+'renames.csv'):
    rr=[r for r in csv.DictReader(open(D+'renames.csv')) if r.get('old') and r.get('new')]
    rr.sort(key=lambda r: r.get('date',''))   # earliest first; later overwrites
    for r in rr: renames[r['old']]=r['new']
    # break 2-cycles (e.g. FISV->FI 2023 then FI->FISV 2025): drop the edge whose
    # source is the other's target, keeping the later rename (current ticker wins)
    for a in list(renames):
        b=renames.get(a)
        if b in renames and renames[b]==a:  # a<->b cycle
            renames.pop(a, None)            # a sorted earlier -> drop it
def final_tk(tk):
    seen=set()
    while tk in renames and tk not in seen: seen.add(tk); tk=renames[tk]
    return tk
if renames:
    # SURGICAL: route only a POST-1996 span (start>1996) to its final ticker, so
    # the renamed company's fja history merges under one ticker. Do NOT route
    # censored (pre-1996) tickers or Chen identities -> avoids ticker-reuse
    # contamination (e.g. an old 1963 'COG' must not merge into modern Coterra).
    f2=defaultdict(list)
    for tk,spans in fja_spans.items():
        for (s,e) in spans:
            tgt = final_tk(tk) if (tk in renames and s>=CENSOR) else tk
            f2[tgt].append((s,e))
    fja_spans=f2
    fja_universe=set(fja_spans)

# ---- 2000-boundary resolution: companies that CONTINUED past Chen's 2000 cap ----
boundary_continue={}   # chen ticker -> ticker it continued as (DH->TGT, CTL->LUMN)
boundary_exit={}       # chen ticker -> real exit date (those that genuinely left)
if os.path.exists(D+'boundary_resolved.csv'):
    for r in csv.DictReader(open(D+'boundary_resolved.csv')):
        tk=r.get('ticker'); cont=(r.get('continued_as') or '').strip(); ex=(r.get('true_exit') or '').strip()
        if not tk: continue
        if cont and cont!=tk: boundary_continue[tk]=cont
        elif ex and ex not in ('still-in','unknown',''):
            try:
                if len(ex)==4: boundary_exit[tk]=date(int(ex),12,31)
                elif len(ex)==7: y,m=ex.split('-'); boundary_exit[tk]=date(int(y),int(m),28)
                else: boundary_exit[tk]=pd(ex)
            except: pass

def canon_of_perm(p):
    tk=perm2tk.get(p)
    if tk in boundary_continue: tk=boundary_continue[tk]   # continue under successor
    return final_tk(tk) if tk else ('chen:'+norm(perm_name.get(p,p)))

# ---- wiki + lookup entry dates (by ticker) ----
wiki={}
for r in csv.DictReader(open(D+'wiki_entry_dates.csv')):
    try: wiki[r['ticker']]=pd(r['date_added'])
    except: pass
import re as _re
def parse_entry(v):
    """curated entry value -> date. handles 'YYYY', full ISO dates, and free-text
    like 'before 1996' / '<=1996' / 'before-1976' (-> Dec 31 of the prior year)."""
    v=(v or '').strip()
    if not v or v.lower()=='unknown': return None
    try: return pd(v)                                    # full ISO date
    except: pass
    m=_re.search(r'(\d{4})', v)
    if not m: return None
    y=int(m.group(1))
    if 'before' in v.lower() or '<' in v: return date(y-1,12,31)
    return date(y,1,1)
if os.path.exists(D+'undated_resolved.csv'):
    for r in csv.DictReader(open(D+'undated_resolved.csv')):
        d_=parse_entry(r.get('sp500_added'))
        if d_: wiki.setdefault(r['ticker'], d_)

# Chen-earliest real add per canon (for opening-entry fallback)
chen_first_add={}
for p,evs in chen_ev.items():
    a=[d for d,f in evs if f==1]
    if a: chen_first_add.setdefault(canon_of_perm(p), min(a))

# manual overrides (workflow-curated): ticker -> canonical entry date (highest priority)
override={}
if os.path.exists(D+'entry_overrides.csv'):
    for r in csv.DictReader(open(D+'entry_overrides.csv')):
        d_=parse_entry(r.get('entry'))
        if d_: override[r['ticker']]=d_

def resolved_entry(tk):
    if tk in override: return override[tk]
    if tk in wiki: return wiki[tk]
    if tk in chen_first_add: return chen_first_add[tk]
    return OG

# ---- merge all add/delete events per canonical company ----
events=defaultdict(list)
for p,evs in chen_ev.items():
    c=canon_of_perm(p)
    for (d,f) in evs: events[c].append((d,f))
for tk,spans in fja_spans.items():
    for (s,e) in spans:
        if s>CENSOR:
            events[tk].append((s,1))             # real post-1996 join
        else:
            # censored fja start (=1996-01-02): company is IN at 1996, real entry
            # unknown -> open a span at its resolved entry (override/wiki/Chen/OG).
            events[tk].append((resolved_entry(tk),1))
        if e: events[tk].append((e,-1))

# tickers that are genuinely ACTIVE in fja (end blank) -> may run to ASOF
fja_active=set(tk for tk,spans in fja_spans.items() for (s,e) in spans if e is None)
fja_lastend={}
for tk,spans in fja_spans.items():
    ends=[e for (s,e) in spans if e]
    if ends: fja_lastend[tk]=max(ends)

# ---- build canonical spans per company ----
spans_by_canon={}
for c,ev in events.items():
    ev=sorted(set(ev))
    # dedupe near-duplicate same-direction events (Chen vs fja overlap, within 10d)
    dd=[]
    for d,f in ev:
        if dd and dd[-1][1]==f and abs((d-dd[-1][0]).days)<=10: continue
        dd.append((d,f))
    # a curated override is authoritative: force the opening at the override date
    # and drop any earlier events (ticker-reuse artifacts, e.g. a 1975 'COMS').
    if c in override:
        od=override[c]
        dd=[(od,1)]+[e for e in dd if e[0]>od]
    # opening entry: if first event is a delete (in before it) OR no add events,
    # the company was already in -> prepend an add at its resolved entry date.
    has_add=any(f==1 for _,f in dd)
    starts_in = (dd and dd[0][1]==-1)
    # resolve opening entry (override > wiki > Chen-first-add > 1957 floor)
    if starts_in or not has_add:
        op=resolved_entry(c)
        dd=[(op,1)]+ [e for e in dd if not (e[0]<=op)]   # prepend, drop pre-entry noise
    # pair into [entry,exit] spans
    sp=[]; cur=None
    for d,f in dd:
        if f==1 and cur is None: cur=d
        elif f==-1 and cur is not None: sp.append((cur,d)); cur=None
    if cur is not None:
        # unpaired add still open. Run to ASOF (2026) ONLY if the ticker is truly
        # active in fja now. Else close at its last known fja exit, or (Chen-only,
        # no fja record) at Chen's 2000 coverage end -- don't fake activity to 2026.
        if c in fja_active: ex=ASOF
        elif c in boundary_exit and boundary_exit[c]>cur: ex=boundary_exit[c]  # real exit (guard vs ticker-reuse)
        elif c in fja_lastend: ex=fja_lastend[c]
        else: ex=CHEN_END
        sp.append((cur, ex))
    # merge spans separated by < 1yr (false splits: share-class swaps, dedup gaps)
    sp.sort(); merged=[]
    for s,e in sp:
        if merged and (s-merged[-1][1]).days < 365: merged[-1]=(merged[-1][0], max(e,merged[-1][1]))
        else: merged.append((s,e))
    # if the ticker is active in fja NOW, its current stint must reach 2026 -- a
    # Chen share-class delete must not close a company that is still in the index.
    if c in fja_active and merged and merged[-1][1] < ASOF:
        merged[-1]=(merged[-1][0], ASOF)
    if merged: spans_by_canon[c]=merged

# ---- evaluate membership + tenure quarterly ----
# Name the "chen:" OG leftovers from their Chen identity (name/ticker from the
# delete event) instead of blanking them. Use the NAME as the label: distinct
# companies have distinct names, so this won't collide with modern reused tickers
# (e.g. old Anaconda 'A' vs Agilent 'A') the way the ticker would.
def pretty(nm):
    s=' '.join(w.capitalize() for w in nm.split())
    for suf in (' Co',' Inc',' Corp',' Corporation',' Company',' Cos',' Inc De',' Ltd'):
        if s.endswith(suf): s=s[:-len(suf)]
    return s.strip()
chen_disp={}
for p in set(perm_name)|set(perm_tk):
    c=canon_of_perm(p)
    if c.startswith('chen:'):
        chen_disp.setdefault(c, pretty(perm_name.get(p,'')) or perm_tk.get(p,'') or c[5:])
def disp(c): return (chen_disp.get(c,c[5:]) if c.startswith('chen:') else c)

# ---- full name + short ticker per canon (rich tooltips + UNIQUE grouping id) ----
# tickers are NOT unique over time (reuse: old vs modern ADM/TXT/CS), so the chart
# must group/trace by the canonical id, not the ticker. id = the canon string.
tk2name={}
for f,nk,tkc in [('changes/datahub_constituents.csv','Security','Symbol'),
                 ('changes/analyzingalpha_constituents.csv','name','ticker'),
                 ('sources/analyzingalpha_sp500_history.csv','name','ticker'),
                 ('changes/analyzingalpha_history.csv','name','ticker')]:
    if os.path.exists(D+f):
        for r in csv.DictReader(open(D+f)):
            tkv=(r.get(tkc) or '').strip(); nmv=(r.get(nk) or '').strip()
            if tkv and nmv: tk2name.setdefault(tkv, nmv if not nmv.isupper() else pretty(nmv))
# small manual map for recent/renamed stragglers not in any list
for k,v in {'CTRA':'Coterra Energy','DAY':'Dayforce','ENE':'Enron','UTX':'United Technologies',
            'BNY':'BNY Mellon','RVTY':'Revvity','BBWI':'Bath & Body Works','GL':'Globe Life',
            'BALL':'Ball Corporation','LHX':'L3Harris Technologies','VLTO':'Veralto','GEV':'GE Vernova',
            'SOLV':'Solventum','KVUE':'Kenvue','GEHC':'GE HealthCare','S':'Sprint','CNP':'CenterPoint Energy'}.items():
    tk2name.setdefault(k,v)
if os.path.exists(D+'ticker_names.csv'):                # workflow-backfilled delisted names
    for r in csv.DictReader(open(D+'ticker_names.csv')):
        if r.get('ticker') and r.get('name'): tk2name.setdefault(r['ticker'].strip(), r['name'].strip())
chen_tk={}
for p in set(perm_tk):
    c=canon_of_perm(p)
    if c.startswith('chen:'): chen_tk.setdefault(c, perm_tk.get(p,''))
def canon_name(c): return chen_disp.get(c,c[5:]) if c.startswith('chen:') else tk2name.get(c,c)
def canon_ticker(c): return (chen_tk.get(c,'') if c.startswith('chen:') else c)

rows={'q':[],'t':[],'id':[],'ticker':[],'name':[],'entry_year':[],'exit_year':[],'tenure':[]}
series=[]
for y in range(1963,2027):
  for m in (3,6,9,12):
    T=date(y,m,28)
    if T>ASOF: continue
    ty_=yr(T); cells=[]
    for c,sp in spans_by_canon.items():
        for (s,e) in sp:
            if s<=T<e:
                cells.append(((T-s).days/365.25, c, yr(s), yr(e))); break
    # sort by tenure, then by EXIT date so ties (same entry) order STABLY across
    # quarters (a company's neighbours don't churn quarter-to-quarter).
    cells.sort(key=lambda x:(x[0], x[3]))
    tens=[x[0] for x in cells]
    if tens:
        series.append((f"{y}-Q{m//3}",len(cells),round(statistics.median(tens),2)))
    for x in cells:
        q=f"{y}-Q{m//3}"
        rows['q'].append(q); rows['t'].append(ty_); rows['id'].append(x[1])
        rows['ticker'].append(canon_ticker(x[1])); rows['name'].append(canon_name(x[1]))
        rows['entry_year'].append(x[2]); rows['exit_year'].append(round(x[3],2)); rows['tenure'].append(round(x[0],2))
pq.write_table(pa.table(rows), D+'heatmap.parquet', compression='snappy')
print(f"crosswalk perm->tk: {sum(1 for v in perm2tk.values())} | canonical companies: {len(spans_by_canon)} | parquet rows: {len(rows['q'])}")
print("\nSEAM CHECK (median tenure, span-derived — should be SMOOTH across 1996):")
for q,n,md in series:
    if q in ('1980-Q4','1990-Q4','1994-Q4','1995-Q4','1996-Q1','1996-Q4','1998-Q4','2000-Q4','2002-Q4','2012-Q4','2026-Q1'):
        print(f"  {q}: n={n:4} median={md:5.1f}")
