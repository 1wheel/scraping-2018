var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {scraper, parseResultSet} = require('./nba-util.js')


var isFinals = {}

glob
  .sync(__dirname + '/raw-years/*')
  .map(io.readDataSync)
  .forEach(year => {
    var team = year.parameters.TeamID
    var year = 1 + +year.parameters.Season.slice(0, 4)

    isFinals[team + '' + year] = true
  })

// console.log(isFinals)

var isAll = false

var statlines = []

glob
  .sync(__dirname + '/boxscoretraditional/*')
  .map(io.readDataSync)
  // .slice(400, 401)
  .forEach(box => {
    var year = 1 + +box.parameters.GameID.slice(3, 5)
    year = year < 20 ? 2000 + year : 1900 + year


    parseResultSet(box.resultSets[0]).forEach(d => {
      if (!isAll && !isFinals[d.TEAM_ID + '' + year]) return

      // console.log(d)
      var name = d.PLAYER_NAME
      var pts = d.PTS || 0
      var reb = d.REB || 0
      var ast = d.AST || 0
      var blk = d.BLK || 0
      var stl = d.STL || 0 
      var total = pts + reb + ast + blk + stl
      var team = d.TEAM_ABBREVIATION
      var game = d.GAME_ID
      statlines.push({year, team, name, pts, total, game, reb, ast, blk, stl})      
    })
    
    
  })


statlines = _.sortBy(statlines, d => d.year)
  .filter(d => d.year == 2018)

io.writeDataSync(__dirname + `/statlines${isAll ? '-all' : ''}.tsv`, statlines)
io.writeDataSync(__dirname + `/../../2018-06-04-lebron-everything/public/_assets/statlines${isAll ? '-all' : ''}.tsv`, statlines)


