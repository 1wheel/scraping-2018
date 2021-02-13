var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {execSync} = require('child_process')


// https://en.wikipedia.org/wiki/Flags_of_country_subdivisions
var str = fs.readFileSync(__dirname + '/Flags_of_country_subdivisions.html', 'utf8')

var tidy = []

var countries = str.split('<h2><span class="mw-headline" id="').slice(1)

countries.forEach(countryStr => {
  var country = countryStr.split('"')[0]

  countryStr.split('flagicon').slice(1).forEach(regionStr => {
    var [__, iconLink, flaglink, nameLink] = regionStr.split('a href="')

    // console.log('x', nameLink)
    if (!nameLink) return

    var nameUrl = nameLink.split('"')[0]
    var name = nameLink.split('title="')[1].split('"')[0]

    var thumbUrl = iconLink.split(' 2x')[0].split(' ').slice(-1)[0]
    var thumbSlug = _.last(thumbUrl.split('/'))
    var flagUrl = nameLink.split('"')[0]

    if (!thumbUrl.includes('//')) return

    tidy.push({country, name, nameUrl, thumbUrl, thumbSlug, flagUrl})
  })
})

io.writeDataSync(__dirname + '/regions.csv', tidy)



function dlImages(){
  var existingImages = glob.sync(__dirname + '/raw-img/' + '*.*')

  var isExisting = {}
  existingImages.forEach(d => isExisting[d.split('/').slice(-1)[0]] = true)

  tidy.forEach(d => {
    if (isExisting[d.thumbSlug]) return
    console.log(d)
    execSync(`curl ${d.thumbUrl.replace('//', 'https://')} > raw-img/${d.thumbSlug}`)
  })
}
dlImages()
