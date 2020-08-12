var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')


var url = 'https://projects.fivethirtyeight.com/2020-nba-predictions/data.json'

request({url}, (error, response, body) => {

  var data = JSON.parse(body)

  // if (data && data.week_forecasts)

  console.log(data)

})
