const { _, cheerio, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')


const players = []

glob.sync(__dirname + `/raw/*.html`).forEach((path, i) => {
    // if (i) return 
    if (path.includes('-aba-finals-')) return 
    const year = path.split('nba/raw/')[1].slice(0, 4)
    const $ = cheerio.load(fs.readFileSync(path, 'utf8'))

    $('.table_wrapper').each(function(){
      const id = $(this).attr('id')
      if (id.length !== 7) return
      const team = id.slice(-3)

      const tableHTML = $(this).html().split('<!--')[1]

      cheerio.load(tableHTML)('tr').each(function(){
        const player = {team, year}
        $('td', this).each((i, tr) => {
          const text = $(tr).text()
          const stat = $(tr).attr('data-stat')
          // TODO track id?
          if (stat === 'player') player.name = text
          if (stat === 'pts') player.pts = +text
        })
        if (player.name && player.name !== 'Team Totals') players.push(player)
      })
    })

    return {year, players}
  })

io.writeDataSync(__dirname + '/nba-players.csv', players)
io.writeDataSync(__dirname + '/../../../1wheel/finals-streaks/nba-players.csv', players)