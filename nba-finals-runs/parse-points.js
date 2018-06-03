var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {scraper, parseResultSet} = require('./nba-util.js')


var statlines = []

glob
  .sync(__dirname + '/boxscoretraditional/*')
  .map(io.readDataSync)
  // .slice(400, 401)
  .forEach(box => {
    var year = 1 + +box.parameters.GameID.slice(3, 5)
    year = year < 20 ? 2000 + year : 1900 + year

    parseResultSet(box.resultSets[0]).forEach(d => {
      var name = d.PLAYER_NAME
      var pts = d.PTS || 0
      var team = d.TEAM_ABBREVIATION

      statlines.push({year, team, name, pts})      
    })
    
    
  })


statlines = _.sortBy(statlines, d => d.year)

io.writeDataSync(__dirname + '/statlines.tsv', statlines)
