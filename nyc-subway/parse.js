var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')


var data = []

var exitStr = 'EXITS                                                               '

glob
  .sync(__dirname + '/csv/*')
  // .slice(-1)
  .forEach((path, i) => {
    if (i < 230) return 

    console.log(path, i)
    var week = io.readDataSync(path)

    if (!week[0][exitStr]) return // skip old format data

    week.forEach(d => {
      d.exits = +d[exitStr]
      d.enters = +d['ENTRIES']
      var [month, day, year] = d.DATE.split('/')
      d.date = [year, month, day].join('-')
      delete d[exitStr]
    })

    var byUnit = jp.nestBy(week, d => [d['C/A'], d.UNIT, d.SCP])
    var units = byUnit.map(snapshots => {
      var last = _.last(_.sortBy(snapshots, d => d.date))
      var {date, exits, enters} = last
      return {date, exits, enters, key: snapshots.key, station: last.STATION}
    })

    var date = _.last(_.sortBy(units, d => d.date)).date
    console.log(date)

    io.writeDataSync(__dirname + `/units/${date}.csv`, units)
  })


