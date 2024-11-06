var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var {exec, execSync} = require('child_process')
var outzip = __dirname + `/2024-wp-raw-data.zip`

function merge(){
  execSync(`cd ${__dirname} && zip -r 2024-wp-raw-data.zip raw-data`, {encoding: 'utf-8'})
  execSync(`rsync -a ${outzip} demo@roadtolarissa.com:../../usr/share/nginx/html/data/2024-wp-raw-data.zip`)
}
setInterval(merge, 60*1000)
merge()
