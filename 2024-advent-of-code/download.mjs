import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)

var fetchObj = {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "priority": "u=0, i",
    "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET"
}

var slugs = d3.cross(d3.range(2015, 2025), d3.range(1, 26))
  .map(([year, day]) => ({year, day}))

scraper({
  slugs,
  slugToUrl: ({year, day}) => `https://adventofcode.com/${year}/leaderboard/day/${day}`,
  slugToPath: ({year, day}) => `${__dirname}/raw/${year}-${day}.html`,
  outregex: `${__dirname}/raw/*.html`,
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

  async function download(slug, cb){
    console.log(slug)
    var outpath = slugToPath(slug)
    var url = slugToUrl(slug)
    if (isDownloaded[outpath]) return cb()

    var res = await fetch(url, fetchObj)
    var text = await res.text()
    fs.writeFile(outpath, text, d => d)

    await sleep(2000)
    cb()
  }
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

