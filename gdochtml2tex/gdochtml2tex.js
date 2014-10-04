var cheerio = require('cheerio');
var fs = require('fs');
var html = fs.readFileSync('/dev/stdin', 'utf-8').toString();
var $ = cheerio.load(html);

var GOOGLE_URL_REDIR = /^https?:\/\/www\.google\.com\/url\?q=([^&]*).*$/;

//console.log(analyzeStyles($('head > style')));

var tokens = tokenize($('body'), [], analyzeStyles($('head > style')));

console.log(tokens);
//console.log(tokens.join('\n'));

function analyzeStyles($style) {

    function extractClassName(forStyles) {
        return ($style.text().match(new RegExp('\\.(\\w+)[\\s\n]*\\{[\\s\\n]*' + Object.keys(forStyles).map(function(key) {
            return key + '\\s*:\\s*' + forStyles[key] + '\\s*;?';
        }).join('') + '[\\s\\n]*\\}')) || [])[1];
    }

    return {
        bold: extractClassName({ 'font-weight': 'bold' }),
        italic: extractClassName({ 'font-style': 'italic' }),
        underline: extractClassName({ 'text-decoration': 'underline' }),
        monospace: extractClassName({ 'font-family': '"?Courier New"?' })
    };

}

function tokenize($node, tokens, classMap) {

    var end;

    if ($node.length !== 1) {
        throw new Error('tokenize() expects a singular cursor $node');
    }

    if ($node.hasClass('title')) {
        tokens.push('\\part{');
        end = '}';
    } else if ($node.get(0).name === 'h1') {
        tokens.push('\\chapter{');
        end = '}';
    } else if ($node.get(0).name === 'h2') {
        tokens.push('\\section{');
        end = '}';
    } else if ($node.get(0).name === 'h3') {
        tokens.push('\\subsection{');
        end = '}';
    } else if ($node.get(0).name === 'h4') {
        tokens.push('\\subsubsection{');
        end = '}';
    } else if ($node.get(0).name === 'a' && $node.attr('href')) {
        tokens.push('\\href{' + unGoogleHref($node.attr('href')) + '}{');
        end = '}';
    } else if ($node.hasClass(classMap.bold)) {
        tokens.push('\\textbf{');
        end = '}';
    } else if ($node.hasClass(classMap.italic)) {
        tokens.push('\\emph{'); // or \textit
        end = '}';
    } else if ($node.hasClass(classMap.underline)) {
        tokens.push('\\underline{');
        end = '}';
    } else if ($node.hasClass(classMap.bold)) {
        tokens.push('\\textbf{');
        end = '}';
    }

    if ($node.children().length === 0) { // leaf nodes contribute text
        tokens.push($node.text().replace(/[\s]+/g, ' ').trim());
    } else { // nodes with children are recursed
        $node.children().each(function() {
            tokenize($(this), tokens, classMap);
        });
    }

    if (end) {
        tokens.push(end);
    }

    return tokens;

}

function unGoogleHref(input) {
    if (input.match(GOOGLE_URL_REDIR)) {
        return decodeURIComponent(input.replace(GOOGLE_URL_REDIR, '$1'));
    } else {
        return input;
    }
}
