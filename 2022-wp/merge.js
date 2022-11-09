var { _, d3, jp, fs, glob, io, queue, request, execSync } = require('scrape-stl')

var {exec} = require('child_process')
var rawdir = __dirname + `/raw-data`
var outdir = __dirname + `/out-data`

var isTopRace = {}
;[
  "AZ-G-S-2022-11-08",
  "CO-G-S-2022-11-08",
  "GA-G-S-2022-11-08",
  "IN-G-S-2022-11-08",
  "IN-G-H-1-2022-11-08",
  "NH-G-S-2022-11-08",
  "NC-G-S-2022-11-08",
  "NC-G-H-13-2022-11-08",
  "OH-G-S-2022-11-08",
  "OH-G-H-1-2022-11-08",
  "OH-G-H-13-2022-11-08",
  "PA-G-S-2022-11-08",
  "PA-G-H-7-2022-11-08",
  "PA-G-H-8-2022-11-08",
  "VA-G-H-2-2022-11-08",
  "VA-G-H-7-2022-11-08",
  "WI-G-S-2022-11-08",
  "NV-G-S-2022-11-08",
  "NH-G-H-2-2022-11-08",
  "NY-G-H-19-2022-11-08",
  "PA-G-H-17-2022-11-08",
  "TX-G-H-34-2022-11-08"
].forEach(d => isTopRace[d] = true)

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
    var nyt = _.findWhere(time, {slug: 'nyt'})
    var nytData = io.readDataSync(nyt.path)

    // var races = nytData.raceCollections.scoreboard_races.map(d => d.nyt_voteshare_estimate)
    var races = nytData.races.filter(race => isTopRace[race.nyt_id]).map(d => d.nyt_voteshare_estimate)
    races.forEach(d => {
      var [state, __, chamber, seat] = d.nyt_id.split('-')
      d.state = state
      d.chamber = chamber
      d.seat = seat
    })

    time.forEach(({slug, path}) => {
      if (slug == 'nyt') return
      console.log(slug)

      var data = io.readDataSync(path)

      races.forEach(race => {
        var key = slug == 'wapo-s' ? 
          `2022-11-08_${race.state}_G_${race.chamber}` : 
          `2022-11-08_${race.state}_G_${race.chamber}_${race.seat}`
        var m = data[key]
        if (m){
          race.wapo = m.estimates
        }
      })
    })

    return {races, scrapeTime: time.key}
  }


  var outpath = outdir + '/2022-wp-latest.json'
  io.writeDataSync(outpath, _.last(timedata))
  exec(`rsync -a ${outpath} demo@roadtolarissa.com:../../usr/share/nginx/html/data/2022-wp-latest.json`)

  var outpath = outdir + '/2022-wp.json'
  io.writeDataSync(outpath, timedata)
  exec(`rsync -a ${outpath} demo@roadtolarissa.com:../../usr/share/nginx/html/data/2022-wp.json`)
}


setInterval(merge, 60*1000)
merge()

