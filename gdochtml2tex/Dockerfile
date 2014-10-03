FROM dockerfile/nodejs

WORKDIR /

RUN npm install cheerio@0.8.1

ADD gdochtml2tex.js /gdochtml2tex.js
ADD cheerio-cli.js /cheerio-cli.js

ENTRYPOINT ["/usr/local/bin/node"]
CMD ["gdochtml2tex.js"]
