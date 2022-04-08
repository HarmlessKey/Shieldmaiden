FROM node:12-alpine
WORKDIR /app

COPY ./dist/ssr .
RUN npm i

EXPOSE 80 443
ENTRYPOINT ["npm", "start"]