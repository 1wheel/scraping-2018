var { _, d3, jp, fs, glob, io, queue, request, execSync } = require('scrape-stl')

var {exec} = require('child_process')
var rawdir = __dirname + `/raw-data`
var outdir = __dirname + `/out-data`


var topRaces = [
  "CO",
  "ME",
  "NM",
  "VA",
  "MN",
  "MI",
  "WI",
  "PA",
  "NV",
  "NC",
  "GA",
  "AZ",
]

var isTopRace = {}
topRaces.forEach(d => isTopRace[d] = true)

var isTopNytRace = {}
topRaces.forEach(d => isTopNytRace[`${d}-G-P-2024-11-05`] = true)

var isTopWapoRace = {}
topRaces.forEach(d => isTopNytRace[`${d}-us-president-2024-general`] = true)

function merge(){
  console.log('starting merge...')

  var tidy = []
  var files = glob.sync(rawdir + '/*.json')
    .map(path => {
      var [slug, time] = path.split('/raw-data/')[1].split('.json')[0].split('__')
      return {slug, time, path}
    })


  var timedata = jp.nestBy(files, d => d.time).map(parseTime)
  function parseTime(time){
    var nytMetadata = _.findWhere(time, {slug: 'nyt-p'})
    var nytData = io.readDataSync(nytMetadata.path)

    var wapoMetadata = _.findWhere(time, {slug: 'wapo-p'})
    var wapoData = io.readDataSync(wapoMetadata.path)

    var races = nytData.races.filter(race => isTopNytRace[race.nyt_id]).map(d => {

      var nyt = d.reporting_units[0].nyt_model_estimates.margin_quantile
      // flip margin is D is winning
      var nytD = d.reporting_units[0].candidates.filter(d => d.nyt_id == 'harris-k')[0]
      var nytR = d.reporting_units[0].candidates.filter(d => d.nyt_id == 'trump-d')[0]
      if (nytD.nyt_model_estimates.win_probability > .5) nyt = nyt.map(d => d*-1).reverse()

      var {nyt_id} = d
      var state_id = nyt_id.split('-')[0] // TODO: handle NE-2?

      var wapo = wapoData[`${state_id.toLowerCase()}-us-president-2024-general`].model_estimates
      return {state_id, nyt, wapo}
    })


    return {races, scrapeTime: time.key}
  }


  console.log('uploading... ', _.last(timedata).scrapeTime)
  var outpath = outdir + '/2024-wp-latest.json'
  io.writeDataSync(outpath, _.last(timedata))
  exec(`rsync -a ${outpath} demo@roadtolarissa.com:../../usr/share/nginx/html/data/2024-wp-latest.json`)

  var outpath = outdir + '/2024-wp.json'
  io.writeDataSync(outpath, timedata)
  exec(`rsync -a ${outpath} demo@roadtolarissa.com:../../usr/share/nginx/html/data/2024-wp.json`)
}


setInterval(merge, 1*60*1000)
merge()

