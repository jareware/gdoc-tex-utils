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
$ curl -s "https://docs.google.com/document/d/6897308f4c2f053eb111ee1d779590064055303d/export?exportFormat=html" \
    | docker run -i gdochtml2tex \
    > output.tex
```
