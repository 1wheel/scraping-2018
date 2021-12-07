// var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)

var headers = io.readDataSync(__dirname + 'headers.json')

var res = await fetch("https://samizdat-graphql.nytimes.com/graphql/v2", {
  headers,
  body: "{\"operationName\":\"TheaterReviewsQuery\",\"variables\":{\"first\":10,\"sortOrder\":\"ASC\",\"cursor\":\"YXJyYXljb25uZWN0aW9uOjk=\"},\"extensions\":{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"d758b4b1501b909d523c32435bbbcd265221e3cc9d945ae787c060d3086da2ea\"}}}",
  "method": "POST"
})



var json = await res.json()

var search = json.data.reviews.theater.search
console.log(d3.keys(search))
console.log(search.pageInfo)
console.log(search.metadata)
console.log(search.edges[0].node)


// scraper({
//   slugs,
//   slugToUrl: d => 'https://www.nytimes.com/svc/collections/v1/publish/www.nytimes.com/by/adam-pearce?sort=newest&page=' + d,
//   slugToPath: d => __dirname + '/raw/' + d + '.json',
//   outregex: __dirname + '/raw/*.json',
//   concurancy: 1,
// })


// function scraper({slugs, slugToPath, slugToUrl, concurancy = 1, outregex}, cb){
//   var isDownloaded = _.indexBy(glob.sync(outregex))

//   var q = queue(concurancy)
//   slugs.forEach(d => q.defer(download, d))
//   q.awaitAll((err, res) => {
//     console.log(err)
//     if (cb) cb(err)
//   })

//   function download(slug, cb){
//     var outpath = slugToPath(slug)
//     if (isDownloaded[outpath]) return cb()

//     var url = slugToUrl(slug)
//     console.log(slug, url)
//     request(url, (err, res) => {

//       cb()
//       if (err || !res.body || res.body.length < 200) return console.log(slug, err, res)

//       fs.writeFile(outpath, res.body, d => d)
//     })
//   }
// }

