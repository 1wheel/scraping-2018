// https://www.nytimes.com/interactive/2022/11/08/us/elections/results-needle-forecast.html


var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var rawdir = __dirname + `/raw-data`

var urls = [
  {slug: 'nyt-p', url: 'https://static01.nyt.com/elections-assets/pages/data/2024-11-05/results-president-forecast-needle.json'},

  {slug: 'wapo-p', url: 'https://elex-page-data-prod.elections.aws.wapo.pub/results/2024-11-05-election-president-national-feed.json'},
  {slug: 'wapo-s', url: 'https://elex-page-data-prod.elections.aws.wapo.pub/results/2024-11-05-election-house-national-feed.json'},
  {slug: 'wapo-h', url: 'https://elex-page-data-prod.elections.aws.wapo.pub/results/2024-11-05-election-senate-national-feed.json'},
]


function download(){
  var dateStr = (new Date()).toISOString()
  urls.forEach(({url, slug}) => {
    request({url}, (err, res, body) => {
      console.log('new download', dateStr)
      fs.writeFileSync(`${rawdir}/${slug}__${dateStr}.json`, body)
    })
  })

}

download()
setInterval(download, 5*60*1000)
