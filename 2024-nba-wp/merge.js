var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var games = glob
  .sync(__dirname + '/raw/json/*.json')
  .map(io.readDataSync)

io.writeDataSync(__dirname + '/2024-nba-wp-games.json', games)
io.writeDataSync(__dirname + '/../../archive-roadtolarissa/data/2024-nba-wp-games.json', games)

// TODO: compress?