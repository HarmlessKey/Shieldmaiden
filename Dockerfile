FROM node:16

WORKDIR /app

COPY ./dist/ssr .
RUN npm i
RUN npm install pm2 -g

ENTRYPOINT ["pm2-runtime", "index.js"]
