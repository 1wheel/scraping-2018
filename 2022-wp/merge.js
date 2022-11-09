var { _, d3, jp, fs, glob, io, queue, request, execSync } = require('scrape-stl')

var {exec} = require('child_process')
var rawdir = __dirname + `/raw-data`
var outdir = __dirname + `/out-data`

function merge(){
  var tidy = []

  var files = glob.sync(rawdir + '/*.json')
    .map(path => {
      var [slug, time] = path.split('/raw-data/')[1].split('.json')[0].split('__')

      return {slug, time, path}
    })

  var byTime = jp.nestBy(files, d => d.time)
  var time = _.last(byTime)

  var nyt = _.findWhere(time, {slug: 'nyt'})
  var nytData = io.readDataSync(nyt.path)

  var races = nytData.raceCollections.scoreboard_races.map(d => d.nyt_voteshare_estimate)
  races.forEach(d => {
    var [state, __, chamber] = d.nyt_id.split('-')
    d.state = state
    d.chamber = chamber
  })

  time.forEach(({slug, path}) => {
    if (slug == 'nyt') return

    var data = io.readDataSync(path)

    races.forEach(race => {
      race.time = time.key 
      var m = data[`2022-11-08_${race.state}_G_${race.chamber}`]
      if (m){
        race.wapo = m.estimates
      }
    })
  })

  var outpath = outdir + '/2022-wp-latest.json'
  io.writeDataSync(outpath, races)
  exec(`rsync -a ${outpath} demo@roadtolarissa.com:../../usr/share/nginx/html/data/2022-wp-latest.json`)
}

// setInterval(merge, 60*1000)
merge()

