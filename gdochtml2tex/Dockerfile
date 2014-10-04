FROM dockerfile/nodejs

WORKDIR /

RUN npm install cheerio@0.17.0

ADD gdochtml2tex.js /gdochtml2tex.js

ENTRYPOINT ["/usr/local/bin/node"]
CMD ["gdochtml2tex.js"]
