#Dockerfile για το frontend,το οποίο δημιουργεί ένα Docker image με nginx server που εξυπηρετεί τα στατικά αρχεία.
FROM nginx:alpine


COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]