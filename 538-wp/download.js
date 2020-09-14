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
  var allForecasts = glob.sync(rawdir + '/*.json')
    .map((path, i, array) => {
      var data = io.readDataSync(path)

      if (i == array.length - 1){
        io.writeDataSync(__dirname + '/538-2020-nba-games.json', data.games)
      }

      var rv = data.weekly_forecasts.forecasts[0]
      rv.timestamp = path.split('/').slice(-1)[0].replace('.json', '')

      return data.weekly_forecasts.forecasts[0]
    })

  allForecasts = _.sortBy(allForecasts, d => d.last_updated)
  var forecasts = d3.nestBy(forecasts, d => d.last_updated).map(_.last)

  // TODO just grab the last update from a given day
  io.writeDataSync(__dirname + '/538-2020-nba-forecasts.json', forecasts)
}



// var data = io.readDataSync(__dirname + '/raw-data/data.json')

// console.log(Object.keys(data))

// console.log(data.clinches)