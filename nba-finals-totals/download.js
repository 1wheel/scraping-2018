var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')

var slugs = `
1974-BOS
1974-MIL
1975-WSB
1975-GSW
1976-BOS
1976-PHO
1977-PHI
1977-POR
1978-SEA
1978-WSB
1979-WSB
1979-SEA
1980-PHI
1980-LAL
1981-HOU
1981-BOS
1982-PHI
1982-LAL
1983-LAL
1983-PHI
1984-BOS
1984-LAL
1985-BOS
1985-LAL
1986-BOS
1986-HOU
1987-BOS
1987-LAL
1988-DET
1988-LAL
1989-LAL
1989-DET
1990-POR
1990-DET
1991-CHI
1991-LAL
1992-POR
1992-CHI
1993-CHI
1993-PHO
1994-HOU
1994-NYK
1995-HOU
1995-ORL
1996-SEA
1996-CHI
1997-UTA
1997-CHI
1998-UTA
1998-CHI
1999-NYK
1999-SAS
2000-LAL
2000-IND
2001-PHI
2001-LAL
2002-NJN
2002-LAL
2003-NJN
2003-SAS
2004-DET
2004-LAL
2005-DET
2005-SAS
2006-MIA
2006-DAL
2007-CLE
2007-SAS
2008-BOS
2008-LAL
2009-ORL
2009-LAL
2010-BOS
2010-LAL
2011-MIA
2011-DAL
2012-MIA
2012-OKC
2013-MIA
2013-SAS
2014-MIA
2014-SAS
2015-CLE
2015-GSW
2016-CLE
2016-GSW
2017-CLE
2017-GSW
2018-CLE
2018-GSW`.trim().split('\n')

scraper({
  slugs,
  slugToUrl: d => {
    var [year, team] = d.split('-')

    return `https://www.basketball-reference.com/teams/${team}/${year}.html`
  },
  slugToPath: d => __dirname + '/raw/' + d + '.html',
  outregex: __dirname + '/raw/*.html',
})


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
    console.log(url)
    
    request({url}, (err, res) => {

      setTimeout(cb, 2000)
      if (err || !res.body || res.body.length < 200) return console.log(slug, err, res)

      fs.writeFile(outpath, res.body, d => d)
    })
  }
}

