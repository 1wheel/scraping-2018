var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var teamyear = glob
  .sync(__dirname + '/raw/*')
  .filter(d => !d.includes('WAS'))
  .filter(d => !d.includes('PHX'))
  // .map(io.readDataSync)
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


