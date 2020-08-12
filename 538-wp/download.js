var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var url = 'https://projects.fivethirtyeight.com/2020-nba-predictions/data.json'
request({url}, (err, res, body) => {
  var dateStr = (new Date()).toISOString()
  fs.writeFileSync(__dirname + `/raw-data/${dateStr}.json`, body)
})


function merge(){
  // TODO merge and write to public folder
}



// var data = io.readDataSync(__dirname + '/raw-data/data.json')

// console.log(Object.keys(data))

// console.log(data.clinches)