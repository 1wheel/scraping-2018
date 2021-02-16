var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
var {execSync} = require('child_process')
var getPixels = require("get-pixels")


// https://en.wikipedia.org/wiki/Flags_of_country_subdivisions
var str = fs.readFileSync(__dirname + '/Flags_of_country_subdivisions.html', 'utf8')

var tidy = []

var countries = str.split('<h2><span class="mw-headline" id="').slice(1)

countries.forEach(countryStr => {
  var country = countryStr.split('"')[0]

  if (!country) return
  country = country.replace(/_/g, ' ')

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

// io.writeDataSync(__dirname + '/regions.csv', tidy)



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
  // colors are distributed mostly evenly
  // var colors = d3.range(256).map(i => Math.round(i/51))
  // console.log(colors.join(' '))

  var six = d3.range(6)
  var colors = d3.cross(d3.cross(six, six), six).map(([[r, g], b]) => {
    var rgb = `rgb(${r*51}, ${g*51}, ${b*51})`
    var hsl = d3.hsl(rgb)

    var {h, l} = hsl
    if (h >= 345) h = 0
    if (h == null) h = -1000
    if (isNaN(h)) h = 1000

    return {r, g, b, rgb, h, l, hsl}
  })



  colors = _.sortBy(colors, d => d.l)
  colors = _.sortBy(colors, d => d.h)
  // colors = _.sortBy(colors, d => d.hsl.l < .1 ? -1 : d.hsl.l > .95 ? 1 : 0)
  io.writeDataSync(__dirname + '/colors.json', colors)
  io.writeDataSync(__dirname + '/../../1wheel/region-flags/colors.json', colors)


  var id2index = {}
  colors.forEach(({r, g, b}, i) => id2index[r + '' + g + '' + b] = i)

  var flags = tidy.map(d => null)

  tidy.forEach((d, flagIndex) => {
    getPixels(`raw-img/${d.thumbSlug}`, (err, {data}) => {

      var colorArray = colors.map(d => 0)

      var numPixels = data.length/4
      d3.range(numPixels).forEach(i => {
        var r = Math.round(data[i*4 + 0]/51)
        var g = Math.round(data[i*4 + 1]/51)
        var b = Math.round(data[i*4 + 2]/51)

        var index = id2index[r + '' + g + '' + b]

        colorArray[index] += 1/numPixels
      })

      flags[flagIndex] = colorArray
      d.colors = colorArray

      // lolll
      if (tidy.every(d => d.colors)){
        io.writeDataSync(__dirname + '/regions.json', tidy)
        io.writeDataSync(__dirname + '/../../1wheel/region-flags/regions.json', tidy)
      }
    })
  })
}
calcColors()