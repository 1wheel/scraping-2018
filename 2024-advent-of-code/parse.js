var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var cheerio = require('cheerio')

var tidy = []
glob
  .sync(__dirname + '/raw/*.html')
  // .slice(0, 1)
  .forEach(path => {
    var [year, day] = path.split('/').at(-1).replace('.html', '').split('-')

    var html = fs.readFileSync(path, 'utf8')

    parseLeaderboard(html).forEach(d => {
      d.year = year
      d.day = day
      tidy.push(d)
    })
  })

tidy = _.sortBy(tidy, d => +d.part)
tidy = _.sortBy(tidy, d => +d.year)
tidy = _.sortBy(tidy, d => +d.day)
io.writeDataSync(`${__dirname}/tidy.tsv`, tidy)


function parseLeaderboard(html) {
  var $ = cheerio.load(html)
  var results = []
  
  // First find all leaderboard entries (breaks if day isn't done lol)
  var bothStars = $('.leaderboard-entry').toArray().slice(0, 100)
  var firstStar = $('.leaderboard-entry').toArray().slice(100)

  ;[firstStar, bothStars].forEach((entries, partIndex) => {
    var part = partIndex + 1
    
    entries.forEach(entry => {
      var $entry = $(entry)
      var time = $entry.find('.leaderboard-time').text().trim()
      // var rank = +$entry.find('.leaderboard-position').text().replace(/[()]/g, '').trim()
      
      // Get name by taking everything between time and optional (AoC++)
      var name = $entry
        .text()
        .split(time)[1]
        .split('(AoC++)')[0]
        .trim()
      
      // Add seconds calculation
      var [h, m, s] = time.split('  ')[1].split(':').map(d => +d)
      var seconds = h*3600 + m*60 + s;``
      
      if (time && name) results.push({part, seconds, name})
    })
  })
  
  return results
}


// we can ignore date, leaderboard always finishes in one day
// console.log(d3.nestBy(dayDate, d => d.time.split('  ')[0]).length)
