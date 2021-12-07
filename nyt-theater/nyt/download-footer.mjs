// var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)


var shows = io.readDataSync(__dirname + '/../iobdb/shows.csv')

var headers = io.readDataSync(__dirname + '/headers.json')
var body = {
  "operationName":"FooterBlockQuery",
  "variables":{"id":"https://www.nytimes.com/2008/09/16/theater/reviews/16pass.html"},
  "extensions":{"persistedQuery":{"version":1,"sha256Hash":"fe2e9d88d1449920ecf37be7e723ce9e1f500d6bdab409491e651b95e8dfeef9"}}
}


// data.anyWork.reviewItems[0]

scraper({
  slugs: shows.map(d => d.index),
  slugToPath: d => __dirname + '/raw/footer/' + d + '.json',
  outregex: __dirname + '/raw/footer/*.json',
  concurancy: 1,
})


async function scraper({slugs, slugToPath, concurancy = 1, outregex}, cb){
  var isDownloaded = _.indexBy(glob.sync(outregex))
  console.log(d3.entries(isDownloaded).length)

  var q = queue(concurancy)
  slugs.forEach(d => q.defer(download, d))
  q.awaitAll((err, res) => {
    console.log(err)
    if (cb) cb(err)
  })

  async function download(slug, cb){
    var outpath = slugToPath(slug)
    if (isDownloaded[outpath]) return cb()


    try {
      var searchData = io.readDataSync(outpath.replace('/footer/', '/search-page/'))
      var node = searchData.data.search.hits.edges[0].node.node
      var url = node.url
    } catch (e){
      cb()
    }

    console.log(url)
    body.variables.id = url
    var res = await fetch('https://samizdat-graphql.nytimes.com/graphql/v2', {
      headers,
      body: JSON.stringify(body),
      method: 'POST'
    })

    var text = await res.text()
    fs.writeFile(outpath, text, d => d)

    try {
      var json = JSON.parse(text)
      console.log(json.data.anyWork)
    } catch(e){
      console.log(e)
    }

    await sleep(300)

    cb()
  }
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}






// var hits = json.data.search.hits
// console.log(d3.keys(hits))
// console.log(hits.pageInfo)
// console.log(hits.metadata)
// console.log(hits.edges[0].node)


