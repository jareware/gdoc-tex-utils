var cheerio = require('cheerio');
var fs = require('fs');
var html = fs.readFileSync('/dev/stdin', 'utf-8').toString();

console.log(getLaTeX(html));

function getLaTeX(htmlString) {

    var $ = cheerio.load(htmlString);
    var cssClassMap = analyzeStyles($('head > style'));
    var footnoteMap = analyzeFootnotes($, $('body > hr ~ *')); // things after a <hr> are comments/footnotes
    var tokens = [];

    traverse($('body > *:not(div)')); // ignore any immediate <div> children, as they've been handled by analyzeFootnotes()

    return cleanUpTeX(tokens.join(''));

    function emit(output) {
        if (typeof output === 'string') {
            tokens.push(output);
        } else {
            tokens.push(output.text().replace(/\s+/g, ' ')); // collapse any consecutive whitespace into spaces
        }
    }

    function traverse($node) {

        if (!$node.length) {
            return; // nothing to do
        } else if ($node.length > 1) { // this is a list of nodes...
            return $node.each(function() {
                traverse($(this)); // ...so visit each in turn
            });
        } else if ($node.hasClass('title')) {
            // For now, silently ignore "title"s, as the doc title will most likely be defined somewhere in main.tex
            /*
            emit('\n\\part{');
            traverse($node.contents());
            emit('}\n\n');
            */
        } else if ($node.get(0).name === 'h1') {
            emit('\n\\chapter{');
            traverse($node.contents());
            emit('}\n\\label{' + $node.find('> a').attr('name') + '}\n\n');
        } else if ($node.get(0).name === 'h2') {
            emit('\n\\section{');
            traverse($node.contents());
            emit('}\n\\label{' + $node.find('> a').attr('name') + '}\n\n');
        } else if ($node.get(0).name === 'h3') {
            emit('\n\\subsection{');
            traverse($node.contents());
            emit('}\n\\label{' + $node.find('> a').attr('name') + '}\n\n');
        } else if ($node.get(0).name === 'h4') {
            emit('\n\\subsubsection{');
            traverse($node.contents());
            emit('}\n\\label{' + $node.find('> a').attr('name') + '}\n\n');
        } else if ($node.get(0).name === 'br') {
            emit('\\newline\n');
        } else if ($node.get(0).name === 'a' && $node.attr('href')) {
            if (($node.attr('name') || '').match(/^id\./)) { // bookmark (the mark itself, not a reference to it)
                // TODO: Add support..?
            } else if ($node.attr('href').match(/^#/)) { // document internal link (e.g. reference)
                emit('\\nameref{' + $node.attr('href').replace(/^#/, '') + '}');
            } else { // external link
                emit('\\href{' + unGoogleHref($node.attr('href')) + '}{');
                traverse($node.contents());
                emit('}');
            }
        } else if ( // node is decorated with an "underline", "bold" etc modifier class
            Object.keys(cssClassMap).map(function(key) {
                return $node.hasClass(cssClassMap[key]);
            }).indexOf(true) >= 0
        ) {
            var begins = Object.keys(cssClassMap).filter(function(key) {
                return $node.hasClass(cssClassMap[key]);
            }).map(function(key) {
                return '\\' + key + '{';
            });
            var ends = begins.map(function() {
                return '}';
            });
            begins.forEach(emit);
            traverse($node.contents());
            ends.forEach(emit);
        } else if ($node.get(0).name === 'ol') {
            emit('\n\\begin{enumerate}\n');
            $node.children('li').each(function() {
                emit('\\item ');
                traverse($(this));
                emit('\n');
            });
            emit('\\end{enumerate}\n\n');
        } else if ($node.get(0).name === 'ul') {
            emit('\n\\begin{itemize}\n');
            $node.children('li').each(function() {
                emit('\\item ');
                traverse($(this));
                emit('\n');
            });
            emit('\\end{itemize}\n\n');
        } else if ($node.get(0).name === 'sup') {
            if (
                $node.children().length === 1 &&
                $node.children('a').length === 1 &&
                footnoteMap[$node.find('a').attr('href')]
            ) {
                emit('\\footnote{');
                traverse(footnoteMap[$node.find('a').attr('href')]);
                emit('}');
            }
            // Since we found a <sup> which wasn't a footnote, it's likely a GDocs comment, which we don't want to render -> suppress
        } else if ($node.get(0).name === 'p') {
            traverse($node.contents());
            emit('\n');
        } else if ($node.contents().length) { // this node has children/text nodes...
            $node.contents().each(function() {
                traverse($(this)); // ...so visit each in turn
            });
        } else { // this is a leaf node...
            emit($node); // ...so allow it to emit text
        }

    }

    // TODO: $ becomes \$ inside a "lstlisting" environment
    // So does #

    // TODO: Heading link support

}

function cleanUpTeX(texString) {
    var replace = [
        /’/g,       "'",
        /“/g,       '``',
        /”/g,       "''",
        /—/g,       "--",
        /([$&#_%])/g,'\\$1', // escape some special chars which are problematic
        /\n +/g,    '\n', // remove any spaces immediately following newlines; they don't look nice
        /\n{3,}/g,  '\n\n' // two consecutive newlines ought to be enough for everyone
    ];
    for (var i = 0; i < replace.length; i += 2) {
        texString = texString.replace(replace[i], replace[i + 1]);
    }
    return texString.trim() + '\n';
}

function analyzeStyles($style) {

    function extractClassName(forStyles) {
        return ($style.text().match(new RegExp('\\.(\\w+)[\\s\n]*\\{[\\s\\n]*' + Object.keys(forStyles).map(function(key) {
            return key + '\\s*:\\s*' + forStyles[key] + '\\s*;?';
        }).join('') + '[\\s\\n]*\\}')) || [])[1];
    }

    return {
        textbf:    extractClassName({ 'font-weight': 'bold' }),
        textit:    extractClassName({ 'font-style': 'italic' }),
        underline: extractClassName({ 'text-decoration': 'underline' }),
        texttt:    extractClassName({ 'font-family': '"?Courier New"?' })
    };

}

function analyzeFootnotes($, $footnotes) {

    var map = {};

    $footnotes.find('a').each(function() {
        if (($(this).attr('name') || '').match(/^ftnt/)) {
            map['#' + $(this).attr('name')] = $(this).nextAll();
        }
    });

    return map;

}

function unGoogleHref(input) {
    var GOOGLE_URL_REDIR = /^https?:\/\/www\.google\.com\/url\?q=([^&]*).*$/;
    if (input.match(GOOGLE_URL_REDIR)) {
        return decodeURIComponent(input.replace(GOOGLE_URL_REDIR, '$1'));
    } else {
        return input;
    }
}
