// https://www.nytimes.com/interactive/2022/11/08/us/elections/results-needle-forecast.html


var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var rawdir = __dirname + `/raw-data`

var urls = [
  {slug: 'nyt', url: 'https://static01.nyt.com/elections-assets/2022/data/2022-11-08/results-needle-forecast.json'},
  {slug: 'wapo-s', url: 'https://elex-page-data-prod.elections.aws.wapo.pub/results/2022-11-08_USA_G_S.json'},
  {slug: 'wapo-h', url: 'https://elex-page-data-prod.elections.aws.wapo.pub/results/2022-11-08_USA_G_H.json'},
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
