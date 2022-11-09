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
  var lastTime = _.last(byTime)

  console.log(lastTime)



  return
  io.writeDataSync(outdir + '2022-wp.csv', tidy)
  // exec(`rsync -a ${outpath} public/ demo@roadtolarissa.com:../../usr/share/nginx/html/data/2022-wp.csv`)
}

// setInterval(merge, 60*1000)
merge()

