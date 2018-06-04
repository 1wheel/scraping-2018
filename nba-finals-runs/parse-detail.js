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

var gamescores = []

glob
  .sync(__dirname + '/gamedetail/*')
  .map(d => {
    var str = fs.readFileSync(d, 'utf8')

    if (!str.includes('window.nbaStatsLineScore =')) return

    return JSON.parse(str.split('window.nbaStatsLineScore =')[1].split(';')[0])
  })
  .filter(d => d)
  .forEach(box => {
    // console.log(box)

    var year = box[0].GAME_DATE_EST.slice(0, 4)

    var box = box.map(d => {
      var q1 = d.PTS_QTR1 || 0
      var q2 = d.PTS_QTR2 || 0
      var q3 = d.PTS_QTR3 || 0
      var q4 = d.PTS_QTR4 || 0
      var pts = d.PTS
      var team = d.TEAM_ABBREVIATION
      var game = d.GAME_ID
      var teamID = d.TEAM_ID
      return {year, team, teamID, pts, q1, q2, q3, q4}    
    })


    ;[1, 2, 3, 4, 'pts'].forEach(d => {
      var inStr = d == 'pts' ? d : 'q' + d
      var outStr = 'm' + d

      box[0][outStr] = box[0][inStr] - box[1][inStr]
      box[1][outStr] = box[1][inStr] - box[0][inStr]
    })

    box.forEach(d => {
      // console.log(d.teamID + '' + d.year)
      if (!isFinals[d.teamID + '' + d.year]) return

      gamescores.push(d)
      // d.d2 = d.m2 - d.m1
      // d.d2 = d.m2 - d.m1
      // d.d2 = d.m2 - d.m1
    })
    
  })


gamescores = _.sortBy(gamescores, d => d.year)

io.writeDataSync(__dirname + `/gamescores.tsv`, gamescores)
io.writeDataSync(__dirname + `/../../1wheel/q3-points/gamescores.tsv`, gamescores)

