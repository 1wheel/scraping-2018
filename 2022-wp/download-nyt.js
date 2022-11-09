var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var rawdir = __dirname + `/raw-data/nyt`

var url = 'https://static01.nyt.com/elections-assets/2022/data/2022-11-08/results-needle-forecast.json'

function download(){
  request({url}, (err, res, body) => {
    var dateStr = (new Date()).toISOString()
    console.log('new download', dateStr)
    fs.writeFileSync(`${rawdir}/${dateStr}.json`, body)

    // merge()
  })
}

download()
setInterval(download, 5*60*1000)
