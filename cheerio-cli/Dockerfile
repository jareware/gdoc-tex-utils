FROM dockerfile/nodejs
MAINTAINER Jarno Rantanen <jarno@jrw.fi>

WORKDIR /

RUN npm install cheerio@0.17.0

ADD cheerio-cli.js /cheerio-cli.js

ENTRYPOINT ["/usr/local/bin/node", "cheerio-cli.js"]
