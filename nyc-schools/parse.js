// Parse NYC school test data and extract UWS District 3 schools
// Output: CSV with test results for PS199, PS87, PS9, PS452 and other UWS K-5 schools

var { _, d3, jp, fs, glob, io } = require('scrape-stl')
var XLSX = require('xlsx')

var rawdir = __dirname + '/raw'

// Target schools: Upper West Side District 3 elementary schools (K-5)
// User requested: PS199, PS87, PS9, PS452
// Plus other UWS K-5 schools in District 3
var targetDBNs = [
  '03M009',  // PS 9 - Sarah Anderson School
  '03M075',  // PS 75 - Emily Dickinson School
  '03M084',  // PS 84 - Lillian Weber School
  '03M087',  // PS 87 - William Sherman School
  '03M145',  // PS 145 - Bloomingdale School
  '03M163',  // PS 163 - Alfred E. Smith School
  '03M165',  // PS 165 - Robert E. Simon School
  '03M166',  // PS 166 - Richard Rogers School
  '03M180',  // PS 180 - Hugo Newman School
  '03M185',  // PS 185 - John M. Langston School
  '03M191',  // PS 191 - Amsterdam School
  '03M199',  // PS 199 - Jessie Isador Straus School
  '03M208',  // PS 208 - Alaine L. Locke School
  '03M333',  // PS 333 - Manhattan School for Children
  '03M452',  // PS 452
]

var targetDBNSet = new Set(targetDBNs)

// Parse NYC Open Data JSON files (2013-2023)
function parseOpenData() {
  console.log('Parsing NYC Open Data JSON files...')

  var elaData = JSON.parse(fs.readFileSync(`${rawdir}/ela-2013-2023.json`, 'utf8'))
  var mathData = JSON.parse(fs.readFileSync(`${rawdir}/math-2013-2023.json`, 'utf8'))

  // ELA: Filter for school-level data for target schools, "All Students" category
  var elaSchools = elaData.filter(d =>
    d.report_category === 'School' &&
    targetDBNSet.has(d.geographic_subdivision) &&
    d.category === 'All Students'
  ).map(d => ({
    dbn: d.geographic_subdivision,
    school_name: d.school_name,
    year: parseInt(d.year),
    grade: d.grade,
    subject: 'ELA',
    num_tested: parseInt(d.number_tested) || null,
    mean_scale_score: d.mean_scale_score === 's' ? null : parseInt(d.mean_scale_score),
    level1_pct: d.level_1_1 === 's' ? null : parseFloat(d.level_1_1),
    level2_pct: d.level_2_1 === 's' ? null : parseFloat(d.level_2_1),
    level3_pct: d.level_3_1 === 's' ? null : parseFloat(d.level_3_1),
    level4_pct: d.level_4_1 === 's' ? null : parseFloat(d.level_4_1),
    proficient_pct: d.level_3_4_1 === 's' ? null : parseFloat(d.level_3_4_1),
    source: 'opendata'
  }))

  // Math: Different field names in this dataset
  var mathSchools = mathData.filter(d =>
    d.report_category === 'School' &&
    targetDBNSet.has(d.geographic_division) &&
    d.student_category === 'All Students'
  ).map(d => ({
    dbn: d.geographic_division,
    school_name: d.school_name || '',
    year: parseInt(d.year),
    grade: d.grade,
    subject: 'Math',
    num_tested: parseInt(d.number_tested) || null,
    mean_scale_score: d.mean_scale_score === 's' ? null : parseInt(d.mean_scale_score),
    level1_pct: d.pct_level_1 === 's' ? null : parseFloat(d.pct_level_1),
    level2_pct: d.pct_level_2 === 's' ? null : parseFloat(d.pct_level_2),
    level3_pct: d.pct_level_3 === 's' ? null : parseFloat(d.pct_level_3),
    level4_pct: d.pct_level_4 === 's' ? null : parseFloat(d.pct_level_4),
    proficient_pct: d.pct_level_3_and_4 === 's' ? null : parseFloat(d.pct_level_3_and_4),
    source: 'opendata'
  }))

  console.log(`  Found ${elaSchools.length} ELA records, ${mathSchools.length} Math records`)
  return [...elaSchools, ...mathSchools]
}

// Parse InfoHub Excel files (2018-2025) for newer data
function parseInfoHub() {
  console.log('Parsing InfoHub Excel files...')

  var results = []

  var files = [
    { path: `${rawdir}/school-ela-results-2018-2025.xlsx`, subject: 'ELA', dataSheet: 'ELA - All' },
    { path: `${rawdir}/school-math-results-2018-2025.xlsx`, subject: 'Math', dataSheet: 'Math - All' }
  ]

  for (let file of files) {
    var workbook = XLSX.readFile(file.path)
    var sheetName = file.dataSheet
    if (!workbook.SheetNames.includes(sheetName)) {
      // Try to find a similar sheet
      sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('all') && !s.toLowerCase().includes('note'))
      if (!sheetName) sheetName = workbook.SheetNames[1]
    }

    var sheet = workbook.Sheets[sheetName]
    var data = XLSX.utils.sheet_to_json(sheet)

    console.log(`  ${file.subject}: ${data.length} total rows from sheet "${sheetName}"`)

    // Filter for target schools and "All Students" category
    var schoolData = data.filter(d =>
      targetDBNSet.has(d['DBN']) &&
      d['Category'] === 'All Students'
    )

    console.log(`  Found ${schoolData.length} rows for target schools`)

    // Map to standard format
    for (let row of schoolData) {
      results.push({
        dbn: row['DBN'],
        school_name: row['School Name'] || '',
        year: parseInt(row['Year']),
        grade: String(row['Grade']),
        subject: file.subject,
        num_tested: parseInt(row['Number Tested']) || null,
        mean_scale_score: row['Mean Scale Score'] === 's' ? null : parseInt(row['Mean Scale Score']),
        level1_pct: row['% Level 1'] === 's' ? null : parseFloat(row['% Level 1']),
        level2_pct: row['% Level 2'] === 's' ? null : parseFloat(row['% Level 2']),
        level3_pct: row['% Level 3'] === 's' ? null : parseFloat(row['% Level 3']),
        level4_pct: row['% Level 4'] === 's' ? null : parseFloat(row['% Level 4']),
        proficient_pct: row['% Level 3+4'] === 's' ? null : parseFloat(row['% Level 3+4']),
        source: 'infohub'
      })
    }
  }

  return results
}

// Main
console.log('\n=== NYC UWS School Test Data Parser ===\n')

var openDataResults = parseOpenData()
var infoHubResults = parseInfoHub()

// Combine data, preferring newer data from InfoHub for overlapping years
console.log('\nCombining data...')

// Get years in Open Data
var openDataYears = new Set(openDataResults.map(d => d.year))
console.log(`  Open Data years: ${[...openDataYears].sort().join(', ')}`)

// Get years only in InfoHub (2024, 2025)
var infoHubYears = new Set(infoHubResults.map(d => d.year))
console.log(`  InfoHub years: ${[...infoHubYears].sort().join(', ')}`)

var newYearsFromInfoHub = infoHubResults.filter(d => !openDataYears.has(d.year))
console.log(`  Adding ${newYearsFromInfoHub.length} records from InfoHub for years not in Open Data`)

var allData = [...openDataResults, ...newYearsFromInfoHub]

// Sort by DBN, year, subject, grade
allData = _.sortBy(allData, d => `${d.dbn}-${d.year}-${d.subject}-${d.grade}`)

// Create summary by school and year (all grades combined)
var summaryData = allData.filter(d => d.grade === 'All Grades')
summaryData = _.sortBy(summaryData, d => `${d.dbn}-${d.year}-${d.subject}`)

// Output files
console.log('\nWriting output files...')

// Full data (all grades)
io.writeDataSync(__dirname + '/uws-school-tests-all-grades.csv', allData)
console.log(`  uws-school-tests-all-grades.csv: ${allData.length} rows`)

// Summary data (combined grades)
io.writeDataSync(__dirname + '/uws-school-tests-summary.csv', summaryData)
console.log(`  uws-school-tests-summary.csv: ${summaryData.length} rows`)

// Create a pivot table: schools as rows, year-subject as columns
var pivotData = []
var years = _.uniq(summaryData.map(d => d.year)).sort()
var subjects = ['ELA', 'Math']

var bySchool = _.groupBy(summaryData, d => d.dbn)
for (let dbn of targetDBNs) {
  var schoolRows = bySchool[dbn] || []
  var schoolName = schoolRows[0]?.school_name || dbn

  var row = { dbn, school_name: schoolName }

  for (let year of years) {
    for (let subject of subjects) {
      var match = schoolRows.find(d => d.year === year && d.subject === subject)
      row[`${year}_${subject}_proficient`] = match?.proficient_pct ?? ''
    }
  }

  pivotData.push(row)
}

io.writeDataSync(__dirname + '/uws-school-tests-pivot.csv', pivotData)
console.log(`  uws-school-tests-pivot.csv: ${pivotData.length} schools x ${years.length * subjects.length + 2} columns`)

// JSON output
io.writeDataSync(__dirname + '/uws-school-tests.json', allData)
console.log(`  uws-school-tests.json`)

console.log('\nDone!')

// Print sample data for requested schools
console.log('\n=== Sample Data for Requested Schools ===\n')
var requestedDBNs = ['03M199', '03M087', '03M009', '03M452']
for (let dbn of requestedDBNs) {
  var schoolData = summaryData.filter(d => d.dbn === dbn)
  if (schoolData.length) {
    console.log(`\n${schoolData[0].school_name} (${dbn}):`)
    var bySubject = _.groupBy(schoolData, d => d.subject)
    for (let subject of ['ELA', 'Math']) {
      var subjectData = (bySubject[subject] || []).sort((a, b) => a.year - b.year)
      console.log(`  ${subject}: ${subjectData.map(d => `${d.year}:${d.proficient_pct ?? 'N/A'}%`).join(', ')}`)
    }
  }
}
