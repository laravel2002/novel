const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('test-story.html', 'utf8');
const $ = cheerio.load(html);

console.log('Images:', $('img').map((i, el) => $(el).attr('src')).get().slice(0, 10));
console.log('Poster:', $('img.story-poster').length);
console.log('Book info img:', $('.book-info img').attr('src'));
