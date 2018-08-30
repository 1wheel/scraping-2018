var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')


var teams = 'ATL BOS NJN CHA CHI CLE DAL DEN DET GSW HOU IND LAC LAL MEM MIA MIL MIN NOH NYK OKC ORL PHI PHO POR SAC SAS TOR UTA WAS AND BLB CHS CLR DNN DTF INJ INO KEN MMS PTC PIT PRO SDS SHE SSL STB FLO TRH UTS VIR WSC WAT'.split(' ')


var url = 'https://www.basketball-reference.com/leagues/NBA_1950.html'

slugs = d3.range(1950, 2018)

scraper({
  slugs,
  slugToUrl: d => {
    return `https://www.basketball-reference.com/leagues/NBA_${d}.html`
  },
  slugToPath: d => __dirname + '/raw/seasons/' + d + '.html',
  outregex: __dirname + '/raw/seasons/*.html',
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
