var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var key2unit = {}

var weekFiles = glob.sync(__dirname + '/units/*')

var weeks = glob.sync(__dirname + '/units/*')
  // .slice(0, 10)
  .map((path, i) => {
    var week = io.readDataSync(path)

    week.forEach(d => {
      d.exists = +d.exits
      d.enters = +d.enters
      if (!key2unit[d.key]) key2unit[d.key] = d3.range(weekFiles.length).map(() => NaN)
      key2unit[d.key][i] = d
    })

    return week
  })


// update old station names
var old2new = {}
var data = _.flatten(weeks)
jp.nestBy(data, d => d.key).forEach(unit => {
  var stations = _.uniq(unit.map(d => d.station))
  if (stations.length > 1) old2new[stations[0]] = stations[1]
})

var negs = []

d3.values(key2unit).forEach(unit => {
  unit.forEach((d, i) => {
    if (!d.station) return

    unit.stationNew = old2new[d.station] || d.station  
    // console.log(unit.stationNew, d.station)
    // console.log(d)
    // d.enterDif = 0
    // var prev = unit[i - 1]
    // if (!prev || isNaN(prev.enters)) return
    // d.enterDif = Math.abs(d.enters - prev.enters)
    // if (d.enterDif > 1000000) negs.push({d, prev})

  })
})

var units = d3.entries(key2unit).map(({key, value}) => {
  // console.log(value.stationNew)
  return {
    key,
    station: value.stationNew,
    totalEnters: value.map(d => d.enters)
  }
})

io.writeDataSync(__dirname + '/units.json', units)


// console.log(d3.max(data, d => d.enterDif))
// console.log(negs)

// var byStation = jp.nestBy(d3.values(key2unit), d => d.stationNew)

// console.log(byStation[0])

// console.log(key2unit['A060,R001,00-00-00'])

// console.log(key2unit['PTH08,R540,00-04-01'].map(d => d.enters))




