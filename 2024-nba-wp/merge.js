var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

glob
  .sync(__dirname + '/raw/json/*.json')
  .map(io.readDataSync)
  .forEach(game => {
    console.log(d3.max(game.timestamps, d => d[1]))
  })
