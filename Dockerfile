FROM node:12
WORKDIR /app

COPY ./dist/ssr .
RUN npm i

ENTRYPOINT ["npm", "start"]
