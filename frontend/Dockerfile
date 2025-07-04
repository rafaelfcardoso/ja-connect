# Frontend-only Dockerfile for JA Distribuidora React App
FROM node:18 as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . ./

# Build the React app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx configuration template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx cache directory
RUN mkdir -p /var/cache/nginx

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'envsubst "\$BACKEND_URL" < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Set default backend URL to point to backend container
ENV BACKEND_URL=http://ja-connect_backend:8000

# Expose ports
EXPOSE 80
EXPOSE 3000

# Start nginx with environment substitution
CMD ["/start.sh"]