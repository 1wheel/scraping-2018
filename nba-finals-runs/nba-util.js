var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var headers = {
  'accept-encoding': 'Accepflate, sdch',
  'accept-language': 'he-IL,he;q=0.8,en-US;q=0.6,en;q=0.4',
  'cache-control': 'max-age=0',
  connection: 'keep-alive',
  host: 'stats.nba.com',
  referer: 'http://stats.nba.com/',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
}

function parseResultSet({ headers, rowSet }) {
  return rowSet.map(row => {
    var rv = {}
    row.forEach((d, i) => (rv[headers[i]] = d))
    return rv
  })
}


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
    
    request({url, headers}, (err, res) => {

      setTimeout(cb, 2000)
      if (err || !res.body || res.body.length < 200) return console.log(slug, err, res)

      fs.writeFile(outpath, res.body, d => d)
    })
  }
}




//1610610023
//1610610036


var prevTeams = d3.range(1610610023, 1610610036 + 1).map(TeamID => ({TeamID}))

var teams = [
  { 'Team name': 'Atlanta Hawks', TeamID: '1610612737' },
  { 'Team name': 'Boston Celtics', TeamID: '1610612738' },
  { 'Team name': 'Brooklyn Nets', TeamID: '1610612751' },
  { 'Team name': 'Charlotte Hornets', TeamID: '1610612766' },
  { 'Team name': 'Chicago Bulls', TeamID: '1610612741' },
  { 'Team name': 'Cleveland Cavaliers', TeamID: '1610612739' },
  { 'Team name': 'Dallas Mavericks', TeamID: '1610612742' },
  { 'Team name': 'Denver Nuggets', TeamID: '1610612743' },
  { 'Team name': 'Detroit Pistons', TeamID: '1610612765' },
  { 'Team name': 'Golden State Warriors', TeamID: '1610612744' },
  { 'Team name': 'Houston Rockets', TeamID: '1610612745' },
  { 'Team name': 'Indiana Pacers', TeamID: '1610612754' },
  { 'Team name': 'Los Angeles Clippers', TeamID: '1610612746' },
  { 'Team name': 'Los Angeles Lakers', TeamID: '1610612747' },
  { 'Team name': 'Memphis Grizzlies', TeamID: '1610612763' },
  { 'Team name': 'Miami Heat', TeamID: '1610612748' },
  { 'Team name': 'Milwaukee Bucks', TeamID: '1610612749' },
  { 'Team name': 'Minnesota Timberwolves', TeamID: '1610612750' },
  { 'Team name': 'New Orleans Pelicans', TeamID: '1610612740' },
  { 'Team name': 'New York Knicks', TeamID: '1610612752' },
  { 'Team name': 'Oklahoma City Thunder', TeamID: '1610612760' },
  { 'Team name': 'Orlando Magic', TeamID: '1610612753' },
  { 'Team name': 'Philadelphia 76ers', TeamID: '1610612755' },
  { 'Team name': 'Phoenix Suns', TeamID: '1610612756' },
  { 'Team name': 'Portland Trail Blazers', TeamID: '1610612757' },
  { 'Team name': 'Sacramento Kings', TeamID: '1610612758' },
  { 'Team name': 'San Antonio Spurs', TeamID: '1610612759' },
  { 'Team name': 'Toronto Raptors', TeamID: '1610612761' },
  { 'Team name': 'Utah Jazz', TeamID: '1610612762' },
  { 'Team name': 'Washington Wizards', TeamID: '1610612764' }
]

function gameID2year(id){
  var year = +id.slice(3, 5)
  year = year < 40 ? 2000 + year : 1900 + year
  return year
}


module.exports = {headers, parseResultSet, teams, prevTeams, scraper, gameID2year}
