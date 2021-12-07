import {_, cheerio, d3, jp, fs, glob, io, queue, request} from 'scrape-stl' 
import fetch from 'node-fetch'

import { URL } from 'url'
var __dirname = new URL('.', import.meta.url).pathname.slice(0, -1)


var shows = io.readDataSync(__dirname + '/../iobdb/shows.csv')

// shows = [shows[103]]
shows.forEach(d => { 
  // console.log(d)

  // join search results
  try {
    var search = io.readDataSync(__dirname + '/raw/search-page/' + d.index + '.json')

    var node = search.data.search.hits.edges[0].node.node

    d.nyt_firstPublished = node?.firstPublished.split('T')[0]
    d.nyt_byline = node?.bylines[0]?.renderedRepresentation

    d.nyt_headline = node.promotionalHeadline
    d.nyt_summary = node.creativeWorkSummary
    d.nyt_url = node.url
    // console.log(node)
  } catch(e){
    // console.log(e)
  }

  // join review api 
  try {
    var w = io.readDataSync(__dirname + '/raw/footer/' + d.index + '.json').data.anyWork
    d.isTheaterReview = w?.compatibility.isTheaterReview

    // d.nyt_name = w.reviewItems[0].

    var rItem = w.reviewItems[0].subject

    // TODO handle reviews with multiple items
    // if (w.reviewItems.length > 1) console.log(d.firstPublished, w.reviewItems.length)

    console.log(rItem)
    d.nyt_openDate = rItem.openDate?.split('T')[0]
    d.nyt_startDate = rItem.startDate?.split('T')[0]
    d.nyt_stopDate = rItem.stopDate?.split('T')[0]
    d.nyt_cast = rItem.cast
    d.nyt_creators = rItem.creators

    d.nyt_name = rItem.performance?.name
    d.nyt_venue = rItem.venue?.name
  } catch(e){
    // console.log(e)

  }

  // console.log(d)
})


io.writeDataSync(__dirname + '/shows.csv', shows.filter(d => d.isTheaterReview))


// if (w.reviewItems.length > 1) console.log(d.firstPublished, w.reviewItems.length)
