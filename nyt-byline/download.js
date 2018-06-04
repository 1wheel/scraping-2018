var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var slugs = d3.range(10)

scraper({
  slugs,
  slugToUrl: d => 'https://www.nytimes.com/svc/collections/v1/publish/www.nytimes.com/by/adam-pearce?sort=newest&page=' + d,
  slugToPath: d => __dirname + '/raw/' + d + '.json',
  outregex: __dirname + '/raw/*.json',
  concurancy: 1,
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
    console.log(slug, url)
    request(url, (err, res) => {

      cb()
      if (err || !res.body || res.body.length < 200) return console.log(slug, err, res)

      fs.writeFile(outpath, res.body, d => d)
    })
  }
}

