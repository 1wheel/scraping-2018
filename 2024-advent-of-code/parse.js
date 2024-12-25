var { _, d3, jp, fs, glob, io, queue, request } = require('scrape-stl')
const cheerio = require('cheerio');

var tidy = []
glob
  .sync(__dirname + '/raw/*.html')
  // .slice(0, 1)
  .forEach(path => {
    var [year, day] = path.split('/').at(-1).replace('.html', '').split('-')

    var html = fs.readFileSync(path, 'utf8')

    parseLeaderboard(html).forEach(d => {
      d.year = year
      d.day = day
      tidy.push(d)
    })
  })

io.writeDataSync(`${__dirname}/tidy.tsv`, tidy)


function parseLeaderboard(html) {
  const $ = cheerio.load(html);
  const results = [];
  
  // First find all leaderboard entries
  const bothStars = $('.leaderboard-entry').toArray().slice(0, 100);  // First 100 entries are for both stars
  const firstStar = $('.leaderboard-entry').toArray().slice(100);     // Next 100 entries are for first star

  // Process both parts
  [bothStars, firstStar].forEach((entries, partIndex) => {
    const part = partIndex + 1;
    
    entries.forEach(entry => {
      const $entry = $(entry);
      
      const rank = +$entry.find('.leaderboard-position').text().replace(/[()]/g, '').trim();
      const time = $entry.find('.leaderboard-time').text().trim();
      
      // Get name, handling anonymous users and different name formats
      let name;
      if ($entry.find('.leaderboard-anon').length) {
        name = $entry.find('.leaderboard-anon').text().trim();
      } else {
        // Try to get name from link or span
        name = $entry.find('a').last().text().trim() || 
               $entry.contents().filter(function() {
                 return this.type === 'text';
               }).text().trim() ||
               $entry.find('span').last().text().trim();
      }
      
      // Clean up the name
      name = name.replace(/\s+/g, ' ').trim();
      
      if (rank && time && name) {  // Only add if we have all fields
        results.push({
          part,
          rank,
          time,
          name
        });
      }
    });
  });
  
  return results;
}
