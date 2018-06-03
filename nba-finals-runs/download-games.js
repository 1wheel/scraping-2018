var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {scraper, parseResultSet} = require('./nba-util.js')


var games = []

glob
  .sync(__dirname + '/raw-years/*')
  .map(io.readDataSync)
  .forEach(year => {
    games.push(parseResultSet(year.resultSets[0]))
  })


slugs = _.uniq(_.flatten(games).map(d => d.Game_ID))


scraper({
  slugs,
  slugToUrl: d => `http://stats.nba.com/stats/boxscoretraditionalv2?EndPeriod=10&EndRange=31800&GameID=${d}&RangeType=0&SeasonType=Playoffs&StartPeriod=1&StartRange=0`,
  slugToPath: d => __dirname + '/boxscoretraditional/' + d + '.json',
  outregex: __dirname + '/boxscoretraditional/*.json',
})

// http://stats.nba.com/stats/boxscoretraditionalv2?EndPeriod=10&EndRange=31800&GameID=0041700401&RangeType=0&SeasonType=Playoffs&StartPeriod=1&StartRange=0
