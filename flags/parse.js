var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {execSync} = require('child_process')
var getPixels = require("get-pixels")


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
// dlImages()



function calcColors(){
  // var colors = d3.range(256).map(i => Math.round(i/51))
  // console.log(colors.join(' '))

  var six = d3.range(6)
  var colors = d3.cross(d3.cross(six, six), six).map(([[r, g], b]) => {
    var rgb = `rgb(${r*51}, ${g*51}, ${b*51})`
    var hsl = d3.hsl(rgb)

    return {r, g, b, rgb, hsl}
  })

  colors = _.sortBy(colors, d => d.hsl.h)
  var id2index = {}
  colors.forEach(({r, g, b}, i) => id2index[r + '' + g + '' + b] = i)

  var flags = tidy.map(d => null)

  tidy.forEach((d, flagIndex) => {
    getPixels(`raw-img/${d.thumbSlug}`, (err, {data}) => {

      var colorArray = colors.map(d => 0)

      var numPixels = data.length/4
      d3.range(numPixels).forEach(i => {
        var r = data[i*4 + 0]
        var g = data[i*4 + 0]
        var b = data[i*4 + 0]

        var index = id2index[r + '' + g + '' + b]

        colorArray[index] += 1/numPixels
      })

      flags[flagIndex] = colorArray

      // lolll
      if (flags.every(d => d)){
        io.writeDataSync(__dirname + '/flag-colors.json', {colors, flags})
      }
    })
  })
}
calcColors()