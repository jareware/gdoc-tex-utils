FROM dockerfile/nodejs

RUN npm install cheerio@0.8.1

ADD gdochtml2tex.js /data/gdochtml2tex.js

CMD ["/usr/local/bin/node", "/data/gdochtml2tex.js"]
