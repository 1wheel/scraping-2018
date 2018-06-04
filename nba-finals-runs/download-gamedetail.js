var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {scraper, parseResultSet, gameID2year} = require('./nba-util.js')


var games = []

glob
  .sync(__dirname + '/raw-years/*')
  .map(io.readDataSync)
  .forEach(teamyear => {
    // var games = parseResultSet(teamyear.resultSets[0])
    // var year = gameID2year(games[0].Game_ID)
    // console.log(parseResultSet(year.resultSets[0])[0].Game_ID)

    games.push(parseResultSet(teamyear.resultSets[0]))
  })


slugs = _.uniq(_.flatten(games).map(d => d.Game_ID))




scraper({
  slugs,
  slugToUrl: d => `https://stats.nba.com/game/${d}/`,
  slugToPath: d => __dirname + '/gamedetail/' + d + '.html',
  outregex: __dirname + '/gamedetail/*.html',
})

// http://stats.nba.com/stats/boxscoretraditionalv2?EndPeriod=10&EndRange=31800&GameID=0041700401&RangeType=0&SeasonType=Playoffs&StartPeriod=1&StartRange=0


//https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/gamedetail/0041700401_gamedetail.json
//https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2017/scores/gamedetail_0044600224.json
