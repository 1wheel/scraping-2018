var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var slugs = []

glob
  .sync(__dirname + '/raw/seasons/*')
  .map(path => {
    var year = _.last(path.split('/')).split('.html')[0]
    var html = fs.readFileSync(path, 'utf8')

    var table = html
      .split('div_team-stats-per_game')[1]
      .split('<tbody>')[1]
      .split('</tbody></table>')[0]
      .trim()

    table.split('href="/teams/').slice(1).forEach(d => {
      slugs.push(year + '-' +d.split('/')[0])
    })
  })

console.log(slugs)


scraper({
  slugs,
  slugToUrl: d => {
    var [year, team] = d.split('-')
    return `https://www.basketball-reference.com/teams/${team}/${year}.html`
  },
  slugToPath: d => __dirname + '/raw/teams/' + d + '.html',
  outregex: __dirname + '/raw/teams/*.html',
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
