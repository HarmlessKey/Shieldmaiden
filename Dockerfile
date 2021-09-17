# FROM alpine

# RUN apk add thttpd

# RUN adduser -D static
# USER static
# WORKDIR /home/static

# COPY ./dist .

# EXPOSE 8080

# CMD ["thttpd", "-D", "-h", "0.0.0.0", "-p", "8080", "-d", "home/static", "-u", "static", "-l", "-", "-M", "60"]

FROM node:12.22
# Install python
# RUN apk update || : && apk add python -y
# RUN apt update || : && apt install python -y

# ENV NODE_ENV=production
RUN npm install -g http-server

WORKDIR /usr/src/app
COPY package.json ./
COPY .npmrc ./

# COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080
CMD ["http-server", "dist"]
