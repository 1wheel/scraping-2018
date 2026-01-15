# NYC School Test Data - Upper West Side Schools

Collecting NYC public school test data (ELA and Math, grades 3-8) for Upper West Side schools in District 3.

## Target Schools

| DBN | School Name | Address |
|-----|-------------|---------|
| 03M199 | PS 199 Jessie Isador Straus | 270 W 70th St |
| 03M087 | PS 87 William Sherman | 160 W 78th St |
| 03M009 | PS 9 Sarah Anderson | 100 W 84th St |
| 03M452 | PS 452 | 210 W 61st St |

## Data Sources

### Primary Sources (for complete historical data)

1. **NYC Open Data** (2013-2023)
   - ELA 2013-2023: https://data.cityofnewyork.us/Education/English-Language-Arts-ELA-Test-Results-2013-2023/iebs-5yhr
   - Math 2013-2023: https://data.cityofnewyork.us/Education/Math-Test-Results-2013-2023/74kb-55u9
   - ELA 2006-2012: https://data.cityofnewyork.us/Education/2006-2012-English-Language-Arts-ELA-Test-Results-S/phth-xf25
   - Math 2006-2012: https://data.cityofnewyork.us/Education/Math-Test-Results-2006-2012/e5c5-ieuv

2. **NYC DOE InfoHub**
   - https://infohub.nyced.org/reports/academics/test-results
   - Excel files with school-level data by year

3. **NYSED Data Site**
   - https://data.nysed.gov/downloads.php
   - 3-8 Assessment Database (Access/CSV)

### Manual Download Instructions

To download complete datasets:

```bash
# NYC Open Data CSV downloads
curl -L -o csv/ela-2013-2023.csv "https://data.cityofnewyork.us/api/views/iebs-5yhr/rows.csv?accessType=DOWNLOAD"
curl -L -o csv/math-2013-2023.csv "https://data.cityofnewyork.us/api/views/74kb-55u9/rows.csv?accessType=DOWNLOAD"
curl -L -o csv/ela-2006-2012.csv "https://data.cityofnewyork.us/api/views/phth-xf25/rows.csv?accessType=DOWNLOAD"
curl -L -o csv/math-2006-2012.csv "https://data.cityofnewyork.us/api/views/e5c5-ieuv/rows.csv?accessType=DOWNLOAD"
```

### Individual School Profiles (NYSED)

- PS 199: https://data.nysed.gov/profile.php?instid=800000047448
- PS 87: https://data.nysed.gov/profile.php?instid=800000047467
- PS 9: https://data.nysed.gov/profile.php?instid=800000047477
- PS 452: https://data.nysed.gov/profile.php?instid=800000069141
- District 3: https://data.nysed.gov/profile.php?instid=800000047476

## Available Data

### tidy.tsv

Current data from web searches (2024-2025). Columns:
- `dbn` - District Borough Number (school identifier)
- `school_name` - School name
- `year` - Test year
- `subject` - ELA, Math, or grade-specific (e.g., ELA_grade5)
- `proficiency_pct` - Percentage proficient (Levels 3+4)
- `source` - Data source

## Recent Proficiency Rates (2024)

| School | ELA | Math |
|--------|-----|------|
| PS 199 | 83% | 85% |
| PS 87 | 83% | 81% |
| PS 9 | 80% | 86% |
| PS 452 | 72% | 72% |

All schools significantly outperform NYC (47% ELA, 49% Math) and NYS (46% ELA, 52% Math) averages.

## Notes

- Tests not administered in 2020 due to COVID-19
- 2021 tests were optional (low participation, ~20%)
- 2023+ uses Next Generation Learning Standards (not comparable to pre-2023)
- Proficiency = Level 3 or 4 on state assessments
