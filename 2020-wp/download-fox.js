var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var rawdir = __dirname + `/raw-data/fox`

var url = 'https://feeds-elections.foxnews.com/archive/politics/elections/2020/3/polls/dial/all_races/file.json'

function download(){
  request({url}, (err, res, body) => {
    var dateStr = (new Date()).toISOString()
    console.log('new download', dateStr)
    fs.writeFileSync(`${rawdir}/${dateStr}.json`, body)

    // merge()
  })
}

download()
setInterval(download, 30*1000)
