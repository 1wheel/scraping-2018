var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var rawdir = __dirname + `/raw-data`

var url = 'https://projects.fivethirtyeight.com/2020-nba-predictions/data.json'
request({url}, (err, res, body) => {
  var dateStr = (new Date()).toISOString()
  console.log('new download', dateStr)
  fs.writeFileSync(`${rawdir}/${dateStr}.json`, body)

  merge()
})


function merge(){
  // var lastUpdate = null
  var out = glob.sync(rawdir + '/*.json')
    .map((path, i) => {
      var data = io.readDataSync(path)

      // if (!lastUpdate || data.weekly_forecasts.forecasts[0].last_updated > lastUpdate.weekly_forecasts.forecasts[0].last_updated) lastUpdate = data

      var rv = data.weekly_forecasts.forecasts[0]
      rv.timestamp = path.split('/').slice(-1)[0].replace('.json', '')

      return data.weekly_forecasts.forecasts[0]
    })


  // TODO just grab the last update from a given day

  io.writeDataSync(__dirname + '/merged-forecasts.json', out)

}



// var data = io.readDataSync(__dirname + '/raw-data/data.json')

// console.log(Object.keys(data))

// console.log(data.clinches)