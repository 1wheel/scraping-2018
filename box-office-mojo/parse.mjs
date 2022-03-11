import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)


parse('weekly')
parse('weekend')

function parse(periodStr){
  var tidy = []
  glob
    .sync(__dirname + `/raw/${periodStr}-html/*.html`)
    .forEach((path, i) => {

      var slug = _.last(path.split('.html')[0].split('/'))
      // if (slug != '2000W18') return
      var [year, week] = slug.split('W')


      var html = fs.readFileSync(path, 'utf8')

      try {
        var table = html.split('<div id="table" ')[1].split('</table>')[0]
        var rows = table.split('<tr').slice(1)
        var th = rows[0]

      } catch (e){
        return console.log('missing data ' + slug)
      }
      
      th.split('<th ').forEach((d, i) => {
        if (!i) return
        var title = d.split('title="')[1].split('"')[0]
        // console.log(i, title)
      })

      rows.forEach((row, rowIndex) => {
        var rv = {year, week}
        // if (rowIndex) return
        // console.log(rowIndex)
        row.split('<td ').forEach((d, i) => {
          // console.log(i, d)

          if (i == 3){
            rv.name = d.split('href')[1].split('">')[1].split('</a')[0]
            rv.id = d.split('"/release/')[1].split('/')[0]
          }
          if (i == 4){
            rv.gross = d.split('">')[1].split('</td')[0].replaceAll(',', '').replace('$', '')
          }
          if (i == 6){
            rv.theaters = d.split('">')[1].split('</td')[0].replaceAll(',', '')
          }
        })

        if (rv.id) tidy.push(rv)
      })


    })


  io.writeDataSync(__dirname + `/tidy-${periodStr}.csv`, tidy)

}

