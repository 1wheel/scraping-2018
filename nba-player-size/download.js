var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {scraper, parseResultSet} = require('./nba-util.js')

// https://stats.nba.com/js/data/ptsd/stats_ptsd.js
var stats = io.readDataSync(__dirname + '/stats_ptsd.json')
var slugs = stats.data.players
  .filter(d => d[4] == 2019)
  .map(d => d[0])

scraper({
  slugs,
  slugToUrl: d => `http://stats.nba.com/stats/commonplayerinfo?PlayerID=${d}`,
  slugToPath: d => __dirname + '/2019-10-02/' + d + '.json',
  outregex: __dirname + '/2019-10-02/*',
})


