# sp500-tenure

How long companies stay in the S&P 500, quarter by quarter, 1963 → 2026 — survivorship-free, every constituent. Built to check (and rebut) the widely-shared Apollo Academy / Innosight claim that "average tenure is 15 years and collapsing."

**Finding:** tenure is *not* collapsing. Survivorship-free, the *typical* (median) company has held ~13–18 years for six decades; only the long-tenure tail (p70/p80) fans out. The viral "collapsing to 15 years" number is Innosight's `1 / (7-yr CAGR of index churn)` — a churn reciprocal **relabeled** as tenure — anchored to a physically impossible 1958 = 61 years (the 500-stock index only began in March 1957).

Charts: <https://roadtolarissa.com/sketches/sp-500/> (percentile deciles, the stacked-by-tenure heatmap, a Marey of every membership span, cohort lifespan distributions, and a regl morph between layouts).

## Run

```
python3 build_spans.py        # reads data/* → writes data/heatmap.parquet
```

## Sources (all open / survivorship-free)

- **Chen, Noronha & Singal (2004, *Journal of Finance*)** — `data/changes/cns2004.xls`. The survivorship-free spine: every add/delete event 1962–2000 with PERMNO, effective date, company name, ticker. Downloaded from the AFA/JF supplements (via Wayback). The only open record of pre-1996 membership; CRSP otherwise paywalls it.
- **fja05680/sp500** — `data/ticker_start_end.csv`. Daily constituent membership 1996 → 2026 (GitHub, reconstructed from filings).
- **Wurgler & Zhuravskaya (2002), NYU Stern** — cross-check of 1976–2000 changes.
- **Wikipedia / datahub / analyzingalpha** constituent lists — names + recent add-dates (`data/changes/*_constituents.csv`, `data/wiki_entry_dates.csv`).

## Pipeline — `build_spans.py` → `data/heatmap.parquet`

One script, one output. Everything is built on **per-company spans** (entry→exit); membership at any quarter is *derived* from the spans — so there is **no era-switch at 2000** and no seam where the two data sources meet.

Constants: `CENSOR=1996-01-02` (fja start), `OG=1957-03-04` (pre-index floor), `CHEN_END=2000-12-29` (Chen end), `ASOF=2026-06-02`.

1. **Load** Chen events per PERMNO (+name, +ticker) and fja spans per ticker.
2. **Crosswalk** PERMNO → canonical fja ticker (`canon_of_perm`): curated `perm2ticker.json`, direct Chen-ticker==fja-ticker, `crosswalk_resolved.csv` (66 hand-resolved), name match. Un-crosswalked Chen entities keep a `chen:<name>` canon.
3. **Renames** (`renames.csv`, e.g. FB→META, REI→CNP, FON→S) applied **surgically** to post-1996 spans only, so a renamed firm merges under one ticker without contaminating reused tickers.
4. **2000-boundary resolution** (`boundary_resolved.csv`, `boundary_2001_resolved.csv`): firms capped at 2000-12-29 are classified continued-as-successor (DH→TGT, **Lockheed→LMT, Wells Fargo→WFC, Reliant/REI→CNP, Sprint/FON→S**) vs real-exit (Coastal/CGP, Summit/SUB, Union Carbide/UK acquired ~early 2001). Without this, ~10 firms falsely "leave" at the source boundary, producing visible hops.
5. **Entry overrides** (`entry_overrides.csv`) + wiki dates fix entry years and drop ticker-reuse artifacts.
6. **Span pairing**: adds paired with deletes; an unpaired add runs to ASOF only if the ticker is genuinely active in fja now, else to its last fja exit / Chen 2000 cap. Sub-1-yr gaps merged.
7. **OG identification**: a firm in the index before 1962 has no add event but *does* have a Chen **delete** event (name + ticker) when it later leaves — surfaced as the display name (Anaconda, Babcock & Wilcox…) instead of left blank. Named ~335 previously-anonymous OG members.

### ids, not tickers

Tickers are **reused** over time ('A' = Anaconda then Agilent; Marriott 'MHS' then Medco; old vs modern ADM/TXT). The output carries a **unique `id`** (the canonical company key) for grouping/tracing, alongside `ticker` and `name`. Charts group and hover by `id`, never ticker.

### `data/heatmap.parquet` columns

`q` (e.g. "1976-Q2"), `t` (decimal year), `id` (unique canon), `ticker`, `name`, `entry_year`, `exit_year` (~2026.4 if still in), `tenure`. One row per (quarter × member); ~123k rows. Sorted within a quarter by tenure then exit_year (stable tie-break).

## Real events the data shows (not bugs)

- **1976 financials**: ~46 banks/insurers (AmEx, BofA, Chase, Aetna…) entered in one batch ~1976-06-30 — the first time financials were admitted. A real, sharp cohort.
- **AMD**: dropped 2013 (market cap), re-added March 2017 — a genuine exit + re-entry gap.
- **ADM**: in the 1960s, dropped early-1970s, re-added 1981-07-29 — a real gap (same company).

## QA invariants

2026 roster ≈ 503–504; max quarter-over-quarter roster-count drop ≤ 3 (catches boundary seams); 0 duplicate id-quarters; 0 negative tenures; median seam-free across 1996; spot-checks (AAPL 1982, MSFT 1994, META 2013, NVDA 2001).

## The Apollo / Innosight rebuttal

Their "tenure" is `1/(7-yr CAGR of turnover)`, a churn reciprocal — not a measured holding period. The 1958=61yr anchor is impossible (500-index began 1957). Forecast years are plotted as observed. The Apollo page's source links are dead (Innosight→Huron redirect). Median tenure measured directly here stays ~13–18 yrs throughout.

## Notes

- `build_spans.py` is the canonical pipeline; the per-firm validations (1976 financials, the 2000/2001 boundary, ticker-reuse) were resolved with multi-agent web-research workflows whose outputs are the `*_resolved.csv` / `firms_1976*` files.
- Pre-1996 open membership data does not otherwise exist (CRSP-only); the 1963 roster reconstructs to ~443/500.
