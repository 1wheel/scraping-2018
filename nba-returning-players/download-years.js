var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var { scraper, teams } = require('./nba-util.js')

var slugs = []

teams.forEach(({teamID}) => {
  d3.range(1946, 2018).forEach(year => {
    var season = year + '-' + ((year + 1) % 100)
    slugs.push(season + '_' + teamID)
  })
})

// console.log(slugs)

scraper({
  slugs,
  slugToUrl: d => {
    var [season, teamID] = d.split('_')
    console.log(season, teamID)

    return `http://stats.nba.com/stats/teamplayerdashboard?DateFrom=&DateTo=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=Totals&Period=0&PlusMinus=N&Rank=N&Season=${season}&SeasonSegment=&SeasonType=Regular+Season&TeamId=${teamID}&VsConference=&VsDivision=`
  },
  slugToPath: d => __dirname + '/raw-years/' + d + '.json',
  outregex: __dirname + '/raw-years/*.json',
})


;`http://stats.nba.com/stats/teamplayerdashboard?DateFrom=&DateTo=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=Totals&Period=0&PlusMinus=N&Rank=N&Season=2017-18&SeasonSegment=&SeasonType=Regular+Season&TeamId=1610612744&VsConference=&VsDivision=`