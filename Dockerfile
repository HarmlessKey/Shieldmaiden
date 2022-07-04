FROM node:12
RUN --mount=type=secret,id=PM2_PUBLIC \
    --mount=type=secret,id=PM2_SECRET \
    export PM2_PUBLIC_KEY=$(cat /run/secrets/PM2_PUBLIC) && \
    export PM2_SECRET_KEY=$(cat /run/secrets/PM2_SECRET)

WORKDIR /app

COPY ./dist/ssr .
RUN npm i
RUN npm install pm2 -g

ENTRYPOINT ["pm2-runtime", "index.js"]
