var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var headers = {
  'accept-encoding': 'Accepflate, sdch',
  'accept-language': 'he-IL,he;q=0.8,en-US;q=0.6,en;q=0.4',
  'cache-control': 'max-age=0',
  connection: 'keep-alive',
  host: 'stats.nba.com',
  referer: 'http://stats.nba.com/',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
  'x-nba-stats-token': true,
  'x-nba-stats-origin': 'stats',
  cookie: 's_cc=true; s_fid=7913BFBCFCB8C2D2-2334A1378A638112; ak_bmsc=F526417F02589ACDF4A409F45B5C344A17372535FD1A0000CC9E845B3C665649~plvEqyc9voiQ9DR5oAkLR+HMjslt59z0MwS846zKhxqwSQ/L6EIl+x2S832U8uj49JeAZRId/bParEI2+uJy/i4BGKJ9YBrXcKL+ZqFW2b3HkJaOhGWJK+8DEIuWrnlo8FYWLv4kp207pKyftlavd4c3tq777NhIVC0Et42XHP3VfvH0XnIEnFLnOQMgjmIYByx66LLDNDB92vwHGiVQ5qk80z52deOJ10teBfNd9KyIU=; s_sq=%5B%5BB%5D%5D; bm_sv=17B6762F48D93A2855E00A0E88398B8E~FPnrJiR2u44ECcZWMHAX50adD3s+TjwM+VS7JttPsdLxDT/FSRlBrwQK2SUKM5fM1eQgffPNd6ORdGgnFWdHI1KQSnnImHsW+XjhZ2Vw1//7XmR1w++BhZt+VajZvUbhT6QMbyqo72S2eCEBLpKCxg=='
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


var prevTeams = d3.range(1610610023, 1610610036 + 1).map(teamID => ({teamID}))

var teams = [
  { 'Team name': 'Atlanta Hawks', teamID: '1610612737' },
  { 'Team name': 'Boston Celtics', teamID: '1610612738' },
  { 'Team name': 'Brooklyn Nets', teamID: '1610612751' },
  { 'Team name': 'Charlotte Hornets', teamID: '1610612766' },
  { 'Team name': 'Chicago Bulls', teamID: '1610612741' },
  { 'Team name': 'Cleveland Cavaliers', teamID: '1610612739' },
  { 'Team name': 'Dallas Mavericks', teamID: '1610612742' },
  { 'Team name': 'Denver Nuggets', teamID: '1610612743' },
  { 'Team name': 'Detroit Pistons', teamID: '1610612765' },
  { 'Team name': 'Golden State Warriors', teamID: '1610612744' },
  { 'Team name': 'Houston Rockets', teamID: '1610612745' },
  { 'Team name': 'Indiana Pacers', teamID: '1610612754' },
  { 'Team name': 'Los Angeles Clippers', teamID: '1610612746' },
  { 'Team name': 'Los Angeles Lakers', teamID: '1610612747' },
  { 'Team name': 'Memphis Grizzlies', teamID: '1610612763' },
  { 'Team name': 'Miami Heat', teamID: '1610612748' },
  { 'Team name': 'Milwaukee Bucks', teamID: '1610612749' },
  { 'Team name': 'Minnesota Timberwolves', teamID: '1610612750' },
  { 'Team name': 'New Orleans Pelicans', teamID: '1610612740' },
  { 'Team name': 'New York Knicks', teamID: '1610612752' },
  { 'Team name': 'Oklahoma City Thunder', teamID: '1610612760' },
  { 'Team name': 'Orlando Magic', teamID: '1610612753' },
  { 'Team name': 'Philadelphia 76ers', teamID: '1610612755' },
  { 'Team name': 'Phoenix Suns', teamID: '1610612756' },
  { 'Team name': 'Portland Trail Blazers', teamID: '1610612757' },
  { 'Team name': 'Sacramento Kings', teamID: '1610612758' },
  { 'Team name': 'San Antonio Spurs', teamID: '1610612759' },
  { 'Team name': 'Toronto Raptors', teamID: '1610612761' },
  { 'Team name': 'Utah Jazz', teamID: '1610612762' },
  { 'Team name': 'Washington Wizards', teamID: '1610612764' }
]

function gameID2year(id){
  var year = +id.slice(3, 5)
  year = year < 40 ? 2000 + year : 1900 + year
  return year
}


module.exports = {headers, parseResultSet, teams, prevTeams, scraper, gameID2year}
