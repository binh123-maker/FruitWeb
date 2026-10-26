#!/bin/bash
set -e

# ====================================================================
# FruitWeb - Automatic SSL & HTTPS Setup Script for AWS EC2
# Domain: 18.225.177.158.sslip.io
# ====================================================================

DOMAIN="18.225.177.158.sslip.io"
EMAIL="${1:-admin@fruitweb.store}"

echo "=========================================================="
echo " Starting HTTPS / SSL Setup for FruitWeb: $DOMAIN"
echo "=========================================================="

# 1. Cài đặt Certbot nếu chưa có
echo "[1/5] Kiểm tra và cài đặt Certbot..."
if ! command -v certbot &> /dev/null; then
    if [ -f /etc/os-release ] && grep -qi "amzn" /etc/os-release; then
        echo "Phát hiện Amazon Linux - Đang cài đặt Certbot..."
        sudo dnf install -y python3-pip
        sudo pip3 install certbot
    elif [ -f /etc/os-release ] && grep -qi "ubuntu" /etc/os-release; then
        echo "Phát hiện Ubuntu - Đang cài đặt Certbot..."
        sudo apt-get update && sudo apt-get install -y certbot
    else
        echo "Đang cài đặt qua pip3..."
        sudo pip3 install certbot
    fi
fi

# 2. Tạm dừng frontend 10 giây để giải phóng Port 80 cho Certbot xác thực
echo "[2/5] Tạm dừng frontend để Certbot xác thực qua cổng 80..."
docker stop fruitweb_frontend || true

# 3. Yêu cầu cấp chứng chỉ Let's Encrypt miễn phí
echo "[3/5] Đang yêu cầu chứng chỉ SSL từ Let's Encrypt cho $DOMAIN..."
sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --keep-until-expiring

# Phân quyền để Docker container có thể đọc chứng chỉ
sudo chmod -R 755 /etc/letsencrypt/archive
sudo chmod -R 755 /etc/letsencrypt/live

# 4. Sao chép cấu hình Nginx SSL vào thư mục dự án
echo "[4/5] Áp dụng cấu hình Nginx SSL..."
cd ~/fruitweb

cat << 'EOF' > nginx.ssl.conf
limit_req_zone $binary_remote_addr zone=fruit_api_limit:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=fruit_auth_limit:10m rate=10r/m;

server {
    listen 80;
    listen [::]:80;
    server_name 18.225.177.158.sslip.io 18.225.177.158 localhost;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 18.225.177.158.sslip.io 18.225.177.158;

    root /usr/share/nginx/html;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/18.225.177.158.sslip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/18.225.177.158.sslip.io/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    server_tokens off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://images.unsplash.com https://upload.wikimedia.org https://*.unsplash.com; connect-src 'self' http: https:; frame-ancestors 'self';" always;

    resolver 127.0.0.11 valid=30s ipv6=off;
    set $backend_upstream "http://backend:8000";

    client_max_body_size 10M;

    location = /docs {
        proxy_pass $backend_upstream/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location = /openapi.json {
        proxy_pass $backend_upstream/openapi.json;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location ~* ^/api/(auth|users/login|users/register) {
        limit_req zone=fruit_auth_limit burst=5 nodelay;
        limit_req_status 429;

        proxy_pass $backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
        proxy_send_timeout 30s;
    }

    location /api {
        limit_req zone=fruit_api_limit burst=30 nodelay;
        limit_req_status 429;

        proxy_pass $backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
        proxy_send_timeout 30s;
    }

    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Cập nhật docker-compose.prod.yml để mount port 443 và chứng chỉ SSL
cat << 'EOF' > docker-compose.prod.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: fruitweb_postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - fruitweb_pgdata:/var/lib/postgresql/data
    networks:
      - fruitweb_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: binh9325/fruitweb-backend:latest
    container_name: fruitweb_backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - .env
    networks:
      - fruitweb_net

  frontend:
    image: binh9325/fruitweb-frontend:latest
    container_name: fruitweb_frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./nginx.ssl.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    networks:
      - fruitweb_net

volumes:
  fruitweb_pgdata:

networks:
  fruitweb_net:
    driver: bridge
EOF

# 5. Khởi động lại toàn bộ containers
echo "[5/5] Khởi động lại hệ thống với HTTPS..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "=========================================================="
echo " ĐÃ HOÀN TẤT THIẾT LẬP BẢO MẬT HTTPS!"
echo " Bạn hãy đảm bảo AWS Security Group đã mở Port 443 (HTTPS)."
echo " Truy cập website an toàn tại:"
echo " 👉 https://$DOMAIN"
echo "=========================================================="
