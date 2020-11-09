var { _, d3, jp, fs, glob, io, queue, request, execSync } = require('scrape-stl')

var {exec} = require('child_process')


var rawdir = __dirname + `/raw-data`
console.log(rawdir)

function merge(){

  var tidy = []

  glob.sync(rawdir + '/fox/*.json')
    .forEach((path, i, array) => {
      // console.log(path)
      try {
        io.readDataSync(path)
      } catch (e){
        return 
      }

      io.readDataSync(path).forEach(d => {
        if (!d.race_id.includes('-P-')) return

        var rProb = -1
        if (d.cand1.party == 'GOP') rProb = d.cand1.probability
        if (d.cand2.party == 'GOP') rProb = d.cand2.probability

        if (rProb == -1){
          if (d.cand1.party == 'Dem') rProb = 1 - d.cand1.probability
          if (d.cand2.party == 'Dem') rProb = 1 - d.cand2.probability
        }

        if (rProb == -1){
          // console.log(d)
          return 
        }

        var {last_update, state, error} = d

        if (last_update > '2020-11-04 09:01:45') return

        tidy.push({last_update, state, error, rProb})
      })
    })

  var outpath = rawdir + '/fox-2020-wp.csv'
  io.writeDataSync(outpath, tidy)

  exec(`rsync -a ${outpath} public/ demo@roadtolarissa.com:../../usr/share/nginx/html/data/fox-2020-wp.csv`)
}

setInterval(merge, 60*1000)
merge()


// {
//   cand1: {
//     party: 'Dem',
//     name: 'Joe Biden',
//     probability: 0.99,
//     candidate_id: '51802',
//     winner: 'x'
//   },
//   cand2: {
//     party: 'GOP',
//     name: 'Donald Trump',
//     probability: 0.01,
//     candidate_id: '51373'
//   },
//   winning: 'Joe Biden',
//   last_update: '2020-11-03 20:23:43',
//   state: 'VA',
//   race_id: 'VA-P-00',
//   error: '0.02',
//   winning_party: 'Dem',
//   called: true
// }
