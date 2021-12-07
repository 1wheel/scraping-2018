// var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)

var slugs = d3.range(0, 2450, 50)

scraper({
  slugs,
  slugToUrl: d => 'http://www.iobdb.com/AdvancedSearch/ProductionCriteria?search=Search&ProductionFirstPerformanceDate.Min=01%2F01%2F1800&ProductionFirstPerformanceDate.Max=12%2F31%2F2021&CreditCreditableEntityHasStar=Any&CreditReplacement=Any&CreditAwardNominated=Any&CreditAwardWon=Any&ActingCreditUnderstudy=Any&groupsToSkip=' + d,
  slugToPath: d => __dirname + '/raw/search-page/' + d + '.html',
  outregex: __dirname + '/raw/search-page/*.html',
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

