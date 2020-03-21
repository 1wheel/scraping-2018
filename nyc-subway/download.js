var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {scraper} = require('../nba-finals-runs/nba-util.js')

var html = fs.readFileSync()

slugs = _.uniq(_.flatten(games).map(d => d.Game_ID))




// scraper({
//   slugs,
//   slugToUrl: d => `https://stats.nba.com/game/${d}/`,
//   slugToPath: d => __dirname + '/gamedetail/' + d + '.html',
//   outregex: __dirname + '/gamedetail/*.html',
// })
