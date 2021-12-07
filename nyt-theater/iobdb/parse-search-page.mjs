// var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)

var shows = []
glob
  .sync(__dirname + '/raw/search-page/*.html')
  .forEach((path, i) => {
    // if (i) return

    var html = fs.readFileSync(path, 'utf8')

    html
      .split('<td><a href="/Production/')
      .forEach((str, j) => {
        var index = str.split('"')[0]

        if (!isFinite(index)) return

        var title = decodeEntities(str.split('title="">')[1].split('</a><')[0])

        var rawDate = str.split('  <td>')[1].split('</td>')[0]
        var [month, day, year] = rawDate.split('/')
        var date = [year, month, day].join('-')

        shows.push({index, title, date})
      })
  })


io.writeDataSync(__dirname + '/shows.csv', shows)


// https://stackoverflow.com/questions/44195322/a-plain-javascript-way-to-decode-html-entities-works-on-both-browsers-and-node
function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}



// scraper({
//   slugs,
//   slugToUrl: d => 'http://www.iobdb.com/AdvancedSearch/ProductionCriteria?search=Search&ProductionFirstPerformanceDate.Min=01%2F01%2F1800&ProductionFirstPerformanceDate.Max=12%2F31%2F2021&CreditCreditableEntityHasStar=Any&CreditReplacement=Any&CreditAwardNominated=Any&CreditAwardWon=Any&ActingCreditUnderstudy=Any&groupsToSkip=' + d,
//   slugToPath: d => __dirname + '/raw/search-page/' + d + '.html',
//   outregex: __dirname + '/raw/search-page/*.html',
//   concurancy: 1,
// })


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

