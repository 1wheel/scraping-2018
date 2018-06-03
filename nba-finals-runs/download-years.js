var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {scraper} = require('./nba-util.js')


var newFinals = [
  '2016-17_1610612739',
  '2016-17_1610612744',
  '2017-18_1610612739',
  '2017-18_1610612744',
]


var games = io.readDataSync(__dirname + '/allgames.tsv')

var slugs = jp.nestBy(games, d => d.year + '_' + d.Team_ID)
  .filter(d => d.some(d => d.isFinals == 'true'))
  .map(d => d.key)
  .concat(newFinals)

scraper({
  slugs,
  slugToUrl: d => {
    var [year, teamID] = d.split('_')

    return `http://stats.nba.com/stats/teamgamelog?LeagueID=00&Season=${year}&SeasonType=Playoffs&TeamID=${teamID}`
  },
  slugToPath: d => __dirname + '/raw-years/' + d + '.json',
  outregex: __dirname + '/raw-years/*.json',
})


