var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var teamyear = glob
  .sync(__dirname + '/raw/*')
  // .slice(0, 1)
  .map(path => {

    var slug = _.last(path.split('/')).split('.html')[0]
    var [year, team] = slug.split('-')
    console.log(slug)

    var html = fs.readFileSync(path, 'utf8')

    var table = html
      .split('all_playoffs_totals')[1]
      .split('<tbody>')[1]
      .split('</tbody></table>')[0]
      .trim()

    // console.log(table.split('<tr'))

    var players = table.split('<tr').map(row => {
      var rv = {}

      row.split('<td')
        .map(d => d.trim())
        .filter(d => d)
        .forEach(d => {
          var key = d.split(`data-stat="`)[1].split(`"`)[0]
          var val = d.split(`" >`)[1].split(`</`)[0]

          if (key == 'player'){
            val = val.split('>')[1]
            key = 'name'
          } else{
            val = +val
          }
          if (key == 'trb') key = 'reb'

          rv[key] = val
        })    


        return rv    
      })

    return {year, team, players}
  })

// console.log(teamyear)
teamyear = _.sortBy(teamyear, d => d.year)

io.writeDataSync(__dirname + `/../../2018-06-04-lebron-everything/public/_assets/teamyear.json`, teamyear)
io.writeDataSync(__dirname + `/teamyear.json`, teamyear)


var teamtop = teamyear.map(team => {
  var rv = {team: team.team, year: team.year, total: {total: 0}, most: {}}

  var cats = 'pts reb ast stl blk'.split(' ')

  team.players.forEach(d => d.total = 0)

  cats.forEach(key => {
    rv.total[key] = d3.sum(team.players, d => d[key])

    rv.total.total += rv.total[key]

    team.players.forEach(d => {
      d.total += d[key]
    })
  })

  rv.top = _.sortBy(team.players, d => d.total).reverse()[0]

  rv.topName = rv.top.name
  rv.topPercent = rv.top.total/rv.total.total
  // console.log(rv)

  cats.forEach(key => {
    rv.most[key] = team.players.filter(d => d[key]).every(d => d[key] <= rv.top[key])
  })

  return rv
})



io.writeDataSync(__dirname + `/../../2018-06-04-lebron-everything/public/_assets/teamtop.json`, teamtop)
io.writeDataSync(__dirname + `/teamtop.json`, teamtop)


