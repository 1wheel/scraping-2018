var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var { scraper, parseResultSet } = require('./nba-util.js')

var statlines = []

glob
  .sync(__dirname + '/raw-years/*')
  // .slice(10, 14)
  .forEach(path => {
    var box = io.readDataSync(path)
    // console.log(box.resultSets[1])

    var year = +box.parameters.Season.split('-')[0]
    var teamID = box.parameters.TeamID

    parseResultSet(box.resultSets[1]).forEach(d => {
      // console.log(d)
      var name = d.PLAYER_NAME
      var playerID = d.PLAYER_ID
      var min = Math.round(d.MIN)
      var pts = d.PTS
      var reb = d.REB
      var ast = d.AST
      var blk = d.BLK
      var stl = d.STL 
      var game = d.GAME_ID
      statlines.push({ year, teamID, name, playerID, min })      
      // statlines.push({ year, teamID, name, playerID, min, pts, game, reb, ast, blk, stl })      
    })
  })


statlines = _.sortBy(statlines, d => d.year)

io.writeDataSync(__dirname + `/statlines.tsv`, statlines)
io.writeDataSync(__dirname + `/../../1wheel/returning-players/statlines.tsv`, statlines)
// io.writeDataSync(__dirname + `/../../2018-06-04-lebron-everything/public/_assets/statlines${isAll ? '-all' : ''}.tsv`, statlines)


