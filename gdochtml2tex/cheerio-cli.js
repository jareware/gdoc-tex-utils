var cheerio = require('cheerio');
var html = require('fs').readFileSync('/dev/stdin', 'utf-8').toString();
var cssSelector = process.argv[2];
var $ = cheerio.load(html);

// @see https://github.com/cheeriojs/cheerio for the API
$(cssSelector).each(function(i, match) {
    console.log($(match).text());
});
