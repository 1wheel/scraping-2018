// Parse NYC school test data and filter for UWS schools
// Run after downloading CSV files to csv/ directory

var { _, d3, jp, fs, glob, io } = require('scrape-stl')

// Target schools (District 3, Manhattan - Upper West Side)
var targetDBNs = ['03M199', '03M087', '03M009', '03M452']
var targetSchools = {
  '03M199': 'PS 199 Jessie Isador Straus',
  '03M087': 'PS 87 William Sherman',
  '03M009': 'PS 9 Sarah Anderson',
  '03M452': 'PS 452'
}

var allData = []

// Process 2013-2023 ELA data
var elaPath = __dirname + '/csv/ela-2013-2023.csv'
if (fs.existsSync(elaPath)) {
  console.log('Processing ELA 2013-2023...')
  var elaData = io.readDataSync(elaPath)

  elaData.forEach(row => {
    var dbn = row.DBN || row.dbn
    if (targetDBNs.includes(dbn)) {
      allData.push({
        dbn: dbn,
        school_name: targetSchools[dbn] || row['School Name'] || row.school_name,
        year: row.Year || row.year,
        grade: row.Grade || row.grade,
        subject: 'ELA',
        num_tested: +(row['Number Tested'] || row.num_tested || 0),
        proficiency_pct: +(row['% Level 3+4'] || row['Percent Level 3 and 4'] || row.pct_level_3_4 || 0),
        mean_scale_score: +(row['Mean Scale Score'] || row.mean_scale_score || 0)
      })
    }
  })
}

// Process 2013-2023 Math data
var mathPath = __dirname + '/csv/math-2013-2023.csv'
if (fs.existsSync(mathPath)) {
  console.log('Processing Math 2013-2023...')
  var mathData = io.readDataSync(mathPath)

  mathData.forEach(row => {
    var dbn = row.DBN || row.dbn
    if (targetDBNs.includes(dbn)) {
      allData.push({
        dbn: dbn,
        school_name: targetSchools[dbn] || row['School Name'] || row.school_name,
        year: row.Year || row.year,
        grade: row.Grade || row.grade,
        subject: 'Math',
        num_tested: +(row['Number Tested'] || row.num_tested || 0),
        proficiency_pct: +(row['% Level 3+4'] || row['Percent Level 3 and 4'] || row.pct_level_3_4 || 0),
        mean_scale_score: +(row['Mean Scale Score'] || row.mean_scale_score || 0)
      })
    }
  })
}

// Process 2006-2012 ELA data
var ela06Path = __dirname + '/csv/ela-2006-2012.csv'
if (fs.existsSync(ela06Path)) {
  console.log('Processing ELA 2006-2012...')
  var ela06Data = io.readDataSync(ela06Path)

  ela06Data.forEach(row => {
    var dbn = row.DBN || row.dbn
    if (targetDBNs.includes(dbn)) {
      allData.push({
        dbn: dbn,
        school_name: targetSchools[dbn] || row['School Name'] || row.school_name,
        year: row.Year || row.year,
        grade: row.Grade || row.grade,
        subject: 'ELA',
        num_tested: +(row['Number Tested'] || row.num_tested || 0),
        proficiency_pct: +(row['% Level 3+4'] || row['Percent Level 3 and 4'] || row.pct_level_3_4 || 0),
        mean_scale_score: 0
      })
    }
  })
}

// Process 2006-2012 Math data
var math06Path = __dirname + '/csv/math-2006-2012.csv'
if (fs.existsSync(math06Path)) {
  console.log('Processing Math 2006-2012...')
  var math06Data = io.readDataSync(math06Path)

  math06Data.forEach(row => {
    var dbn = row.DBN || row.dbn
    if (targetDBNs.includes(dbn)) {
      allData.push({
        dbn: dbn,
        school_name: targetSchools[dbn] || row['School Name'] || row.school_name,
        year: row.Year || row.year,
        grade: row.Grade || row.grade,
        subject: 'Math',
        num_tested: +(row['Number Tested'] || row.num_tested || 0),
        proficiency_pct: +(row['% Level 3+4'] || row['Percent Level 3 and 4'] || row.pct_level_3_4 || 0),
        mean_scale_score: 0
      })
    }
  })
}

// Sort by school, year, subject, grade
allData = _.sortBy(allData, d => [d.dbn, d.year, d.subject, d.grade])

console.log(`Found ${allData.length} records for target schools`)

if (allData.length > 0) {
  io.writeDataSync(__dirname + '/uws-schools.tsv', allData)
  console.log('Written to uws-schools.tsv')

  // Also create summary by school/year
  var bySchoolYear = jp.nestBy(allData, d => [d.dbn, d.year, d.subject])
  var summary = bySchoolYear.map(group => {
    var totalTested = d3.sum(group, d => d.num_tested)
    var avgProficiency = d3.mean(group, d => d.proficiency_pct)
    return {
      dbn: group[0].dbn,
      school_name: group[0].school_name,
      year: group[0].year,
      subject: group[0].subject,
      total_tested: totalTested,
      avg_proficiency_pct: Math.round(avgProficiency * 10) / 10
    }
  })

  io.writeDataSync(__dirname + '/uws-schools-summary.tsv', summary)
  console.log('Written to uws-schools-summary.tsv')
} else {
  console.log('No data found. Make sure CSV files are downloaded to csv/ directory.')
  console.log('Run: node download.js (or download manually per README instructions)')
}
