# =========================
# Stage 1: Build React App
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_USE_MOCK_DATA=true
ARG VITE_API_URL=
ENV VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build production
RUN npm run build


# =========================
# Stage 2: Run with Nginx
# =========================
FROM nginx:alpine

ARG NGINX_CONF=docker/nginx/nginx.standalone.conf

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]