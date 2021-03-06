gdoc-tex-utils
==============

Collection of small utils for wrangling Google Docs (text) documents into LaTeX ones.

Dependencies
------------

You'll need [Docker](https://www.docker.com/), `curl` and an Internet connection.

Usage
-----

Make sure the Google Docs document is accessible to "anyone with the link" (or figure out some other way of getting the HTML export).

```
$ docker build -t gdochtml2tex gdochtml2tex/
$ docker build -t texlive texlive/
$ curl -s "https://docs.google.com/document/d/1gHkEYatbgVbri5S3QBqCXtK80IiGHRBm5-_B6gv01qw/export?exportFormat=html" \
    | docker run -i --rm gdochtml2tex \
    > sample/gdoc.tex
$ docker run -v $(pwd)/sample:/workdir --rm texlive pdflatex main.tex
$ open sample/main.pdf
```

Notable alternatives
--------------------

Services:

 1. https://www.sharelatex.com/ (by far the most useful-looking)
 1. http://tex.uncg.edu/login.php
 1. https://code.google.com/p/latex-lab/
 1. http://www.sci.usq.edu.au/research/googledocs.php

Converters:

 1. https://code.google.com/p/googledoc2latex/wiki/Usage
