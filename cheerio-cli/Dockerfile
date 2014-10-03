MAINTAINER Jarno Rantanen <jarno@jrw.fi>
FROM dockerfile/nodejs

WORKDIR /

RUN npm install cheerio@0.17.0

ADD cheerio-cli.js /cheerio-cli.js

ENTRYPOINT ["/usr/local/bin/node"]
CMD ["cheerio-cli.js"]
