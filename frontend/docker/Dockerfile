FROM nginx:alpine

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend files to nginx serve directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]