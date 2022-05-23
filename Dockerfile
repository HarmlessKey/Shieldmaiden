FROM node:12
WORKDIR /app

COPY ./dist/ssr .
RUN npm i

EXPOSE 3000
ENTRYPOINT ["npm", "start"]