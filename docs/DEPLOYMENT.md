# ☁️ Production Deployment Guide

This guide details deployment options for production environments using Docker, Nginx, AWS/DigitalOcean, and SSL certificates.

---

## 1. Environment Variables Configuration
Ensure production `.env` contains secure values:

```ini
PORT=8000
HOST=0.0.0.0
DEBUG=False
SECRET_KEY=change-this-to-a-64-character-random-hex-string
DATABASE_URL=postgresql://pothole_admin:StrongPass2026@postgres-db:5432/pothole_db
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

## 2. PostgreSQL Production Setup
For production workloads, use PostgreSQL instead of SQLite:

```bash
docker run -d \
  --name postgres-pothole \
  -e POSTGRES_USER=pothole_admin \
  -e POSTGRES_PASSWORD=StrongPass2026 \
  -e POSTGRES_DB=pothole_db \
  -p 5432:5432 \
  postgres:15-alpine
```

---

## 3. Nginx Reverse Proxy with SSL (Certbot)

Sample `/etc/nginx/sites-available/roadpothole.conf`:

```nginx
server {
    server_name roadpothole.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
