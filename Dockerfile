FROM nginx

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*

COPY ./dist /usr/share/nginx/html

EXPOSE 80 443
ENTRYPOINT ["nginx", "-g", "daemon off;"]