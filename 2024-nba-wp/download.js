var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

console.log(__dirname)
scraper({
  slugs: d3.range(22300061, 22301047 + 1),
  slugToUrl: d => 'https://stats.inpredictable.com/nba/wpBox.php?gid=00' + d ,
  slugToPath: d => __dirname + '/raw/html/' + d + '.html',
  outregex: __dirname + '/raw/html/*.html',
  concurancy: 1,
})

function scraper({slugs, slugToPath, slugToUrl, concurancy=1, outregex}, cb){
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

