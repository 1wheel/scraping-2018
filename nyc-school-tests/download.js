// NYC Public School Test Results (Grades 3-8 ELA and Math)
// Data sources:
// - NYC Open Data: https://data.cityofnewyork.us
// - ELA 2013-2023: https://data.cityofnewyork.us/Education/English-Language-Arts-ELA-Test-Results-2013-2023/iebs-5yhr
// - Math 2013-2023: https://data.cityofnewyork.us/Education/Math-Test-Results-2013-2023/74kb-55u9
// - ELA 2006-2012 School: https://data.cityofnewyork.us/Education/2006-2012-English-Language-Arts-ELA-Test-Results-S/phth-xf25
// - Math 2006-2012 School: https://data.cityofnewyork.us/Education/2006-2012-Math-Test-Results-School-All-Students/jufi-gzgp

var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var datasets = [
  // 2013-2023 comprehensive datasets
  { name: 'ela-2013-2023', id: 'iebs-5yhr' },
  { name: 'math-2013-2023', id: '74kb-55u9' },
  // 2006-2012 school-level datasets
  { name: 'ela-2006-2012', id: 'phth-xf25' },
  { name: 'math-2006-2012', id: 'e5c5-ieuv' },
]

// Create csv directory
fs.mkdirSync(__dirname + '/csv', { recursive: true })

var q = queue(1)
datasets.forEach(d => q.defer(download, d))
q.awaitAll((err, res) => {
  if (err) console.log('Error:', err)
  console.log('Download complete')
})

function download(dataset, cb) {
  var outpath = __dirname + '/csv/' + dataset.name + '.csv'

  if (fs.existsSync(outpath)) {
    console.log('Already exists:', dataset.name)
    return cb()
  }

  var url = `https://data.cityofnewyork.us/api/views/${dataset.id}/rows.csv?accessType=DOWNLOAD`
  console.log('Downloading:', dataset.name, url)

  request({ url }, (err, res) => {
    setTimeout(() => cb(), 2000)
    if (err || !res.body || res.body.length < 200) {
      console.log('Error downloading', dataset.name, err)
      return
    }

    fs.writeFileSync(outpath, res.body)
    console.log('Saved:', outpath, '(' + res.body.length + ' bytes)')
  })
}
