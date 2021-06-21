const { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')


const seriesHTML = fs.readFileSync(__dirname + '/series.html', 'utf8')
const slugs = seriesHTML.split(`'>Finals</a></td><td`)
  .map(d => _.last(d.split(`class="left " data-stat="series" ><a href='`)))
  .filter(d => d.length < 100)
  .map(d => d.replace('/playoffs/', ''))


const outdir = __dirname + `/raw/`
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir)

scraper({
  slugs,
  slugToUrl: d => {
    return `https://www.basketball-reference.com/playoffs/` + d
  },
  slugToPath: d => outdir + d,
  outregex: outdir + '*.html',
})

function scraper({slugs, slugToPath, slugToUrl, concurancy = 1, outregex}, cb){
  var isDownloaded = _.indexBy(glob.sync(outregex))

  var q = queue(concurancy)
  slugs.forEach(d => q.defer(download, d))
  q.awaitAll((err, res) => {
    console.log(err)
    if (cb) cb(err)
  })

  function download(slug, cb){
    var outpath = slugToPath(slug)
    if (isDownloaded[outpath]) return cb()

    var url = slugToUrl(slug)
    console.log(url)
    
    request({url}, (err, res) => {

      setTimeout(cb, 2000)
      if (err || !res.body || res.body.length < 200) return console.log(slug, err, res)

      fs.writeFile(outpath, res.body, d => d)
    })
  }
}
