var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')


var statlines = []
var teams = []

glob
  .sync(__dirname + '/raw/teams/*')
  // .slice(0, 1)
  .map(path => {
    var [year, teamID] = _.last(path.split('/')).split('.html')[0].split('-')
    var html = fs.readFileSync(path, 'utf8')

    var table = html
      .split('all_roster')[1]
      .split('<tbody>')[1]
      .split('</tbody></table>')[0]
      .trim()

    table
      .split('<tr >')
      .filter(d => d.includes('class'))
      .forEach(row => {
        try{
          var name = row.split('.html')[1].split('>')[1].split('<')[0]
          var playerID = row.split('/players/')[1].split('/')[1].split('.html')[0]
        } catch (e){
          console.log(row)
          throw e
        }
        statlines.push({ year, teamID, name, playerID })      
        // row.split('<td').forEach(d => {
        //   if (!d) return

        //   console.log({d})
        //   var val = d.split('>')[1].split('<')[0]
        //   console.log(val)
        // })
      })
  })


statlines = _.sortBy(statlines, d => d.year)

io.writeDataSync(__dirname + `/statlines.tsv`, statlines)
io.writeDataSync(__dirname + `/../../1wheel/returning-players/statlines.tsv`, statlines)
