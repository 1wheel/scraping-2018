// var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)

var years = d3.range(1977, 2023)
var weeks = d3.range(1, 54).map(d => d3.format('02')(d))

var slugs = d3.cross(years, weeks)
  .map(([year, week]) => year + 'W' + week)

scraper({
  slugs,
  slugToUrl: d => 'https://www.boxofficemojo.com/weekly/' + d + '/',
  slugToPath: d => __dirname + '/raw/weekly-html/' + d + '.html',
  outregex: __dirname + '/raw/weekly-html/*.html',
  concurancy: 10,
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

