// web.mta.info/developers/turnstile.html
// http://web.mta.info/developers/resources/nyct/turnstile/ts_Field_Description.txt
// https://www.reddit.com/r/dataisbeautiful/comments/fmgrl0/new_york_city_subway_usage_was_down_75_last_week/
// https://github.com/toddwschneider/nyc-subway-turnstile-data

var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var slugs = fs.readFileSync(__dirname + '/links.html', 'utf8')
  .split('</a>')
  .map(str => {
    return str.split('.txt">')[0].split('turnstile/')[1]  
  })


scraper({
  slugs,
  slugToUrl: d => `http://web.mta.info/developers/data/nyct/turnstile/${d}.txt`,
  slugToPath: d => __dirname + '/csv/' + d + '.csv',
  outregex: __dirname + '/csv/*.csv',
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
