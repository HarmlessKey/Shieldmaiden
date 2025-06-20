FROM node:24

WORKDIR /app

COPY ./dist/ssr .
COPY .env.production.local .

RUN npm i
RUN npm install pm2 -g

ENTRYPOINT ["pm2-runtime", "index.js"]
