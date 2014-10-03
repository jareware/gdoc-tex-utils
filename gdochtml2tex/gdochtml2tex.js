var cheerio = require('cheerio');
var fs = require('fs');
var html = fs.readFileSync('/dev/stdin', 'utf-8').toString();
var $ = cheerio.load(html);

var $cursor = $('body > h1').prev();
var output = '';
var paragraphBuffer = '';

while (($cursor = $cursor.next()).length) {
    output += getTex($cursor);
}

console.log(output);

function getTex($el) {

    var el = $el[0];
    var text = unescapeHTML($el.text().trim());
    var LaTeX = '';

    if (el.name === 'p' && $el.hasClass('title')) {
        // The document title will currently have to be fixed into the template files
    } else if (el.name === 'h1') {
        LaTeX = '\\chapter{' + text + '}' /*+ '\n\\label{chapter:XXX}'*/;
    } else if (el.name === 'h2') {
        LaTeX = '\\section{' + text + '}';
    } else if (el.name === 'h3') {
        LaTeX = '\\subsection{' + text + '}';
    } else if (el.name === 'h4') {
        LaTeX = '\\subsubsection{' + text + '}';
    } else if (el.name === 'p') {
        if (text === '') { // an empty paragraph purges the buffer
            LaTeX = ' '; // -> trigger the following paragraphBuffer check
        } else {
            paragraphBuffer += formatParagraph($el) + ' ';
            return '';
        }
    } else {
//        LaTeX = '\\bf{UNKNOWN INPUT:} ' + text;
//        throw new Error('Unknown input: ' + $el.html());
    }

    if (LaTeX && paragraphBuffer) { // if there's buffer & something other than paragraphs is to be emitted, purge the buffer first
        LaTeX = paragraphBuffer + '\n\n' + LaTeX;
        paragraphBuffer = '';
    }

    return LaTeX.trim() + '\n\n';

}

function formatParagraph($el) {

    var LaTeX = '';

    $el.find('span').each(function() {

        var $this = $(this);
        var text = unescapeHTML($this.text());

        if ($this.hasClass('c4')) {
            LaTeX += '{\\bf ' + text + '}';
        } else if ($this.hasClass('c3')) {
            LaTeX += '{\\em ' + text + '}';
        } else {
            LaTeX += text + '';
        }

    });

    return LaTeX;

}

function unescapeHTML(text) {

    [
        [ /&amp;/g,     '\\&' ],
        [ /&nbsp;/g,    ' ' ],
        [ /&gt;/g,      '\\textgreater' ],
        [ /&lt;/g,      '\\textless' ],
        [ /&quot;/g,    '"' ],
        [ /&ldquo;/g,   '"' ],
        [ /&rdquo;/g,   '"' ],
        [ /&rsquo;/g,   "'" ],
        [ /&#39;/g,     "'" ],
        [ /#/g,         '\\#']
    ].forEach(function(translation) {
        text = text.replace(translation[0], translation[1]);
    });

    return text;

}
