// var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)


var shows = io.readDataSync(__dirname + '/../iobdb/shows.csv')

var headers = io.readDataSync(__dirname + '/headers.json')
var body = {"operationName":"SearchRootQuery","variables":{"first":10,"sort":"best","text":"theater review lion king","filterQuery":"((section_uri: \"nyt://section/a882ff8b-b544-5d1e-9ccd-0f51bc07595d\"))","sectionFacetFilterQuery":"((section_uri: \"nyt://section/a882ff8b-b544-5d1e-9ccd-0f51bc07595d\"))","typeFacetFilterQuery":"((section_uri: \"nyt://section/a882ff8b-b544-5d1e-9ccd-0f51bc07595d\"))","sectionFacetActive":true,"typeFacetActive":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"36625f535a2f15be8e7bf7165fbc1de88f02a9f7466472360cd0b91480a6c23b"}}}

scraper({
  slugs: shows.map(d => d.index),
  slugToPath: d => __dirname + '/raw/search-page/' + d + '.json',
  outregex: __dirname + '/raw/search-page/*.json',
  concurancy: 1,
})


async function scraper({slugs, slugToPath, concurancy = 1, outregex}, cb){
  var isDownloaded = _.indexBy(glob.sync(outregex))

  var q = queue(concurancy)
  slugs.forEach(d => q.defer(download, d))
  q.awaitAll((err, res) => {
    console.log(err)
    if (cb) cb(err)
  })

  async function download(slug, cb){
    var outpath = slugToPath(slug)
    if (isDownloaded[outpath]) return cb()

    var m = _.find(shows, {index: slug})
    console.log(m.title)

    body.variables.text = 'theater review ' + m.title
    var res = await fetch('https://samizdat-graphql.nytimes.com/graphql/v2', {
      headers,
      body: JSON.stringify(body),
      method: 'POST'
    })

    var text = await res.text()
    fs.writeFile(outpath, text, d => d)

    try {
      var json = JSON.parse(text)
      var hits = json.data.search.hits
      console.log(hits.edges[0].node.node)
    } catch(e){
      console.log(e)
    }

    await sleep(500)

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


