var { _, d3, jp, fs, glob, cheerio, io, queue, request } = require('scrape-stl')


var albums = []
glob.sync(__dirname + '/raw/*').forEach(path => {
  var year = _.last(path.split('/')).replace('.html', '')
  parseHTML(fs.readFileSync(path, 'utf8')).forEach(d => {
    d.year = year
    albums.push(d)
  })
})

io.writeDataSync('albums.tsv', albums)

function parseHTML(html){
  var $ = cheerio.load(html)
  var array = []
  $('.albumListRow').each(function(){
    var rv = {}
    rv.slug = $('span a', this).text()
    rv.rank = $('.albumListRank', this).text().split('.')[0]
    rv.date = $('.albumListDate', this).text()
    rv.genre = $('.albumListGenre', this).text()
    rv.artist = rv.slug.split(' - ')[0]
    rv.album = rv.slug.split(' - ')[1]
    try {
      rv.spotify = $(this).html().split('open.spotify.com/album/')[1].split('/')[0]
    } catch (e){
      rv.spotify = ''
      console.log(rv.album)
    }


    array.push(rv)
  })

  return array
}
