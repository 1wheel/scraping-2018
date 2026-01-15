// NYC Public School Test Results Data Collection
// Sources:
// - NYC Open Data: 2013-2023 ELA/Math results (JSON API)
// - InfoHub: 2018-2025 ELA/Math results (Excel files)

var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var rawdir = __dirname + '/raw'

// NYC Open Data API endpoints (Socrata API)
// These datasets have 2013-2023 data
var openDataSets = [
  {
    name: 'ela-2013-2023',
    // Dataset: English Language Arts (ELA) Test Results 2013-2023
    url: 'https://data.cityofnewyork.us/resource/iebs-5yhr.json?$limit=500000'
  },
  {
    name: 'math-2013-2023',
    // Dataset: Math Test Results 2013-2023
    url: 'https://data.cityofnewyork.us/resource/74kb-55u9.json?$limit=500000'
  }
]

// InfoHub Excel files for 2018-2025 (includes 2024-2025 data not in Open Data)
var infoHubFiles = [
  {
    name: 'school-ela-results-2018-2025',
    url: 'https://infohub.nyced.org/docs/default-source/default-document-library/school-ela-results-2018-2025-public08ab7e5e-26b6-4ffb-aeb7-976f96c96a80.xlsx'
  },
  {
    name: 'school-math-results-2018-2025',
    url: 'https://infohub.nyced.org/docs/default-source/default-document-library/school-math-results-2018-2025-public2ab94267-56ef-48e1-aa0c-e02ea6d80bbb.xlsx'
  }
]

// Download all data files
async function downloadAll() {
  console.log('Downloading NYC school test results...\n')

  // Download NYC Open Data JSON files
  for (let dataset of openDataSets) {
    var outpath = `${rawdir}/${dataset.name}.json`
    if (fs.existsSync(outpath)) {
      console.log(`Already have: ${dataset.name}`)
      continue
    }

    console.log(`Downloading: ${dataset.name}`)
    console.log(`  URL: ${dataset.url}`)

    await new Promise((resolve, reject) => {
      request({url: dataset.url}, (err, res, body) => {
        if (err) {
          console.log(`  Error: ${err}`)
          return reject(err)
        }
        fs.writeFileSync(outpath, body)
        console.log(`  Saved: ${outpath}`)
        resolve()
      })
    })
  }

  // Download InfoHub Excel files
  for (let file of infoHubFiles) {
    var outpath = `${rawdir}/${file.name}.xlsx`
    if (fs.existsSync(outpath)) {
      console.log(`Already have: ${file.name}`)
      continue
    }

    console.log(`Downloading: ${file.name}`)
    console.log(`  URL: ${file.url}`)

    await new Promise((resolve, reject) => {
      request({url: file.url, encoding: null}, (err, res, body) => {
        if (err) {
          console.log(`  Error: ${err}`)
          return reject(err)
        }
        fs.writeFileSync(outpath, body)
        console.log(`  Saved: ${outpath}`)
        resolve()
      })
    })
  }

  console.log('\nDownload complete!')
}

downloadAll()
