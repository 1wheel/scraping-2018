var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')


var pages = glob.sync(__dirname + '/raw/*')
  .map(io.readDataSync)
  .map(d => d.members.items)


var items = _.flatten(pages)

console.log(items[70])

var articles = items
  .map(d => {
    var rv = {}

    rv.slug = _.last(d.url.split('/')).split('.html')[0]
    rv.date = d.publication_date.substr(0, 7)
    rv.url = d.url

    var crops = d.promotional_media.image.image_crops 
    rv.img = crops.master1050 ? crops.master1050.url : crops.blog533 ? crops.blog533.url : ''

    return rv
  })
  .filter(d => !d.url.includes('can-advance-to-the-next-round'))

io.writeDataSync(__dirname + '/articles.json', articles)
fs.writeFileSync(__dirname + '/articles.json', JSON.stringify(articles,null,2))
