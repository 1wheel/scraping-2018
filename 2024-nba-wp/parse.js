var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

glob
  .sync(__dirname + '/raw/html/*.html')
  // .map()
  // .slice(0, 10)
  .forEach(path => {
    console.log(path)
    var slug = path.split('/').at(-1).replace('.html', '')
    var html = fs.readFileSync(path, 'utf8')
    var teams = html.split('teamlogos/nba/500/').slice(1).map(d => d.split('.png')[0])
    var date = html.split('selected>').map(d => d.split('<')[0])[3]

    // "cols": [
    //     {"id":"gt","type":"number"},
    //     {"id":"ann","type":"string"},
    //     {"id":"wprb","type":"number"},
    //     {"id":"tt1","type":"string"},
    //     {"id":"mgn","type":"number"},
    //     {"id":"tt2","type":"string"},
    // ]
    var timestamps = JSON.parse(html.split('],"rows": ')[1].split('});')[0])
      .map(d => [d.c[0].v, d.c[2].v])

    if (timestamps.at(-1)[1] == 1){
      teams.reverse()
      timestamps.forEach(d => d[1] = 1 - d[1])
    }
    var [winner, loser] = teams 

    io.writeDataSync(`${__dirname}/raw/json/${slug}.json`, {slug, winner, loser, date, timestamps})
  })

