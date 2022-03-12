// var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)


var slugs = []

glob
  .sync(__dirname + `/raw/weekend-html/*.html`)
  .forEach((path, i) => {
    var html = fs.readFileSync(path, 'utf8')

    if (!html.includes('weekend-navSelector')) return

    var optionStr = html.split('id="weekend-navSelector"')[1].split('</div>')[0]
    var options = optionStr.split(`value="`).slice(1).map(d => d.split(`/"`)[0])
    // holiday box is always the first option; uses 3-day thanksgiving
    var option = options[0]

    var slug = option.replace('/weekend/', '').split('/')[0]
    var url = 'https://www.boxofficemojo.com' + option + '/'
    slugs.push({slug, url})
  })


scraper({
  slugs,
  slugToUrl: d => d.url,
  slugToPath: d => __dirname + '/raw/weekend-html/' + d.slug + '-o.html',
  outregex: __dirname + '/raw/weekend-html/*.html',
  concurancy: 1,
})

function scraper({slugs, slugToPath, slugToUrl, concurancy = 1, outregex}, cb){
  var isDownloaded = _.indexBy(glob.sync(outregex))

  var q = queue(concurancy)
  slugs.forEach(d => q.defer(download, d))
  q.awaitAll((err, res) => {
    console.log(err)
    if (cb) cb(err)
  })

  function download(slug, cb){
    var outpath = slugToPath(slug)
    if (isDownloaded[outpath]) return cb()

    var url = slugToUrl(slug)
    console.log(slug, url)
    request(url, (err, res) => {

      cb()
      if (err || !res.body || res.body.length < 200) return console.log(slug, err, res)

      fs.writeFile(outpath, res.body, d => d)
    })
  }
}

