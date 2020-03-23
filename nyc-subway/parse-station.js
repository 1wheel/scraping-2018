var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var units = io.readDataSync('units.json')

units.forEach(unit => {
  unit.enters = unit.totalEnters.map((d, i) => {
    var prev = unit.totalEnters[i - 1]
    if (isNaN(prev)) return null

    return d - prev
  })

  var median = d3.median(unit.enters)

  // drop turnstile if it is more than 5x median or negative
  unit.enters = unit.enters.map(d => 0 < d && d < median*5 ? d : null)
})


var byStation = jp.nestBy(units, d => d.station)
var stations = byStation.map(station => {
  var enters = station[0].enters.map((d, i) => {
    return d3.sum(station, d => d.enters[i])
  })

  return {station: station.key, enters}
})




io.writeDataSync(__dirname + '/stations.json', stations)
