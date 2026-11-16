# Hướng dẫn deploy production lên VPS — NUSS (Mai Phương Resort)

Tài liệu dành cho người **lần đầu** đưa website lên chạy thật với domain.

**Phương án đã chốt**

| Mục | Lựa chọn |
|-----|----------|
| VPS | Vietnix **VPS SSD LINUX 3** (4 CPU / **6GB RAM** / 50GB SSD) |
| OS trên server | **Ubuntu 22.04 hoặc 24.04 LTS** |
| Domain | `https://phuquocmaiphuong.com` (đã có sẵn) |
| Cách chạy app | **Docker Compose** trên VPS (FE + BE + DB + Nginx) |
| Máy của bạn | **Windows** — chỉ cần SSH vào VPS (không cần máy Linux) |

**Kiến trúc trên 1 VPS**

```text
Khách vào https://phuquocmaiphuong.com
              │
              ▼
         ┌─ Nginx (cổng 80/443, HTTPS) ─┐
         │                              │
         ├─ /           → Next.js :3000 │
         ├─ /api, /uploads, /actuator
         │              → Spring Boot :8080
         └─ (Postgres :5432 chỉ nội bộ Docker, không mở ra internet)
```

**Chi phí dịch vụ phải trả:** chủ yếu **VPS + gia hạn domain**.  
Cloudflare (tuỳ chọn) và Let's Encrypt (HTTPS) = miễn phí.

> Bản demo free (Vercel + Render + Neon) có thể **giữ** để khách xem trước. Production dùng VPS + domain thật.

---

## Mục lục

0. [Hiểu nhanh trước khi làm](#0-hiểu-nhanh-trước-khi-làm)
1. [Chuẩn bị trước khi thuê VPS](#1-chuẩn-bị-trước-khi-thuê-vps)
2. [Thuê VPS Vietnix](#2-thuê-vps-vietnix)
3. [Đăng nhập SSH từ Windows](#3-đăng-nhập-ssh-từ-windows)
4. [Bảo mật cơ bản lần đầu](#4-bảo-mật-cơ-bản-lần-đầu)
5. [Cài Docker trên VPS](#5-cài-docker-trên-vps)
6. [Chuẩn bị file deploy trong GitHub](#6-chuẩn-bị-file-deploy-trong-github)
7. [Clone code và cấu hình trên VPS](#7-clone-code-và-cấu-hình-trên-vps)
8. [Chạy stack lần đầu](#8-chạy-stack-lần-đầu)
9. [Trỏ domain về VPS](#9-trỏ-domain-về-vps)
10. [Bật HTTPS (Let's Encrypt)](#10-bật-https-lets-encrypt)
11. [Kiểm tra end-to-end](#11-kiểm-tra-end-to-end)
12. [Cách cập nhật code sau này](#12-cách-cập-nhật-code-sau-này)
13. [Backup database (bắt buộc nhớ)](#13-backup-database-bắt-buộc-nhớ)
14. [Checklist trước khi “chính thức”](#14-checklist-trước-khi-chính-thức)
15. [Lỗi thường gặp](#15-lỗi-thường-gặp)

---

## 0. Hiểu nhanh trước khi làm

### VPS là gì?

Một **máy tính ảo thuê theo tháng**, chạy 24/7 trên trung tâm dữ liệu.  
Bạn điều khiển bằng lệnh qua mạng (SSH). Website của khách chạy **trên VPS**, không chạy trên laptop bạn.

### “SSD LINUX” nghĩa là gì?

- **LINUX** = hệ điều hành **trên VPS** (Ubuntu).  
- Máy bạn vẫn dùng **Windows** bình thường.

### FE / BE / DB để đâu?

Cả ba đều trên **cùng một VPS** (qua Docker):

| Thành phần | Chạy bằng |
|------------|-----------|
| Frontend Next.js | container `web` |
| Backend Spring Boot | container `api` |
| PostgreSQL | container `db` |
| Ảnh upload | thư mục trên ổ VPS |
| HTTPS + domain | Nginx (+ Certbot) |

### Bạn sẽ làm theo thứ tự

```text
Thuê VPS → SSH vào → Cài Docker → Đẩy/clone code
→ Chạy Docker → Trỏ DNS domain → Bật HTTPS → Test
```

Làm từng mục. Không cần làm hết trong một buổi.

---

## 1. Chuẩn bị trước khi thuê VPS

### Trên máy Windows

1. Git đã có (repo đã push: `https://github.com/datpham196/maiphuong-resort`).
2. Kiểm tra SSH:

   ```powershell
   ssh -V
   ```

   Nếu không có: Settings → Apps → Optional features → OpenSSH Client.

3. Giữ sẵn file secret local (chỉ trên máy bạn, **không** commit):

   - `nuss-backend/.env`
   - Các key OnePMS, mail, JWT…

4. Ghi ra giấy chỗ trống:

   | Thông tin | Giá trị (điền sau) |
   |-----------|---------------------|
   | IP VPS | |
   | User SSH | thường `root` |
   | Mật khẩu / SSH key | |
   | Domain | `phuquocmaiphuong.com` |
   | Nơi quản lý DNS domain | (hosting cũ / nhà đăng ký / Cloudflare) |

### Trên GitHub

- Repo private `maiphuong-resort` đã có code.  
- Ở **mục 6** sẽ thêm vài file deploy production rồi `git push`.

---

## 2. Thuê VPS Vietnix

1. Vào trang Vietnix → chọn **VPS SSD LINUX 3**.
2. Chu kỳ thanh toán: lần đầu nên **3–6 tháng** hoặc **1 năm** (tránh khóa 2–3 năm ngay nếu chưa chắc).
3. Hệ điều hành: **Ubuntu 22.04 LTS** hoặc **Ubuntu 24.04 LTS**.
4. Hoàn tất thanh toán.
5. Đợi email/hệ thống gửi:

   - **IP public** (vd. `103.x.x.x`)
   - User (thường `root`)
   - Password hoặc hướng dẫn SSH key

6. Ghi IP vào bảng mục 1.

> Nếu Vietnix có tùy chọn firewall: tạm mở cổng **22** (SSH), **80** (HTTP), **443** (HTTPS).  
> **Không** cần mở 5432 (Postgres) ra ngoài internet.

---

## 3. Đăng nhập SSH từ Windows

Mở **PowerShell**:

```powershell
ssh root@IP_CUA_BAN
```

Ví dụ:

```powershell
ssh root@103.20.30.40
```

- Lần đầu hỏi `Are you sure you want to continue connecting?` → gõ `yes`.
- Nhập mật khẩu (gõ không hiện ký tự là bình thường) → Enter.

Vào được sẽ thấy dòng lệnh Linux kiểu:

```text
root@vps-xxxxx:~#
```

Từ đây mọi lệnh ở các mục sau (trừ khi ghi rõ “trên Windows”) đều chạy **trên VPS**.

### Thoát SSH

```bash
exit
```

---

## 4. Bảo mật cơ bản lần đầu

### 4.1. Đổi mật khẩu root (nếu dùng password)

```bash
passwd
```

### 4.2. Cập nhật hệ thống

```bash
apt update && apt upgrade -y
```

### 4.3. (Khuyến nghị) Tạo user thường + SSH key

Người mới có thể dùng `root` lúc đầu cho nhanh, nhưng production nên có user riêng.  
Nếu chưa quen, **làm xong deploy ổn đã**, rồi quay lại siết bảo mật.

### 4.4. Cài firewall UFW

```bash
apt install -y ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

Trả lời `y` khi hỏi enable.

---

## 5. Cài Docker trên VPS

Chạy lần lượt:

```bash
apt install -y ca-certificates curl gnupg git

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Kiểm tra:

```bash
docker --version
docker compose version
```

Thấy số version là OK.

---

## 6. Chuẩn bị file deploy trong GitHub

Làm **trên máy Windows** (trong repo `NUSS`), rồi `git push` lên GitHub.  
Mục tiêu: trên VPS chỉ cần `git clone` / `git pull` là đủ file chạy production.

### 6.1. Cấu trúc file cần có

```text
NUSS/
├── docker-compose.prod.yml      ← orchestration production
├── deploy/
│   ├── nginx/
│   │   ├── default.conf         ← HTTP (trước khi có SSL)
│   │   └── default-ssl.conf     ← HTTPS (sau khi có SSL)
│   └── .env.production.example  ← mẫu biến môi trường
├── nuss-backend/
│   ├── Dockerfile               ← đã có
│   └── ...
└── nuss-client/
    ├── Dockerfile               ← tạo mới
    ├── .dockerignore            ← tạo mới
    └── ...
```

> Nếu bạn nhờ AI tạo sẵn các file này trong repo trước khi lên VPS thì càng tốt — đỡ gõ tay trên server.

### 6.2. `nuss-client/Dockerfile` (nội dung gợi ý)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public API URL is baked in at build time for Next.js
ARG NEXT_PUBLIC_API_BASE_URL=https://phuquocmaiphuong.com
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### 6.3. Bật `output: "standalone"` trong Next.js

Trong `nuss-client/next.config.ts`, thêm:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // ... giữ unsplash, localhost, onrender nếu cần
      {
        protocol: "https",
        hostname: "phuquocmaiphuong.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.phuquocmaiphuong.com",
        pathname: "/uploads/**",
      },
    ],
  },
  // ... turbopack giữ nguyên nếu đang dùng local
};
```

### 6.4. `nuss-client/.dockerignore`

```text
node_modules
.next
.git
.env*
!.env.example
README.md
*.md
```

### 6.5. `docker-compose.prod.yml` (ở gốc repo)

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-nuss}
      POSTGRES_USER: ${POSTGRES_USER:-nuss}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-nuss} -d ${POSTGRES_DB:-nuss}"]
      interval: 5s
      timeout: 5s
      retries: 10
    mem_limit: 512m

  api:
    build:
      context: ./nuss-backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/${POSTGRES_DB:-nuss}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-nuss}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_BOOTSTRAP_USERNAME: ${ADMIN_BOOTSTRAP_USERNAME:-admin}
      ADMIN_BOOTSTRAP_PASSWORD: ${ADMIN_BOOTSTRAP_PASSWORD}
      ONEPMS_SECRET_KEY: ${ONEPMS_SECRET_KEY}
      ONEPMS_ACCOUNT: ${ONEPMS_ACCOUNT}
      ONEPMS_HOTEL_ID: ${ONEPMS_HOTEL_ID}
      ONEPMS_BASE_URL: ${ONEPMS_BASE_URL}
      NUSS_CORS_ORIGINS: ${NUSS_CORS_ORIGINS}
      NUSS_UPLOAD_DIR: /app/uploads
      SERVER_PORT: 8080
      PORT: 8080
      MAIL_HOST: ${MAIL_HOST:-smtp.gmail.com}
      MAIL_PORT: ${MAIL_PORT:-587}
      MAIL_USERNAME: ${MAIL_USERNAME:-}
      MAIL_PASSWORD: ${MAIL_PASSWORD:-}
      MAIL_FROM: ${MAIL_FROM:-}
      MAIL_FROM_NAME: ${MAIL_FROM_NAME:-Mai Phuong Resort}
      MAIL_RESORT_TO: ${MAIL_RESORT_TO:-}
    volumes:
      - uploads:/app/uploads
    mem_limit: 1024m

  web:
    build:
      context: ./nuss-client
      args:
        NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-https://phuquocmaiphuong.com}
    restart: unless-stopped
    depends_on:
      - api
    mem_limit: 512m

  nginx:
    image: nginx:1.27-alpine
    restart: unless-stopped
    depends_on:
      - web
      - api
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - uploads:/var/www/uploads:ro
      - certbot-www:/var/www/certbot:ro
      - certbot-certs:/etc/letsencrypt:ro

  certbot:
    image: certbot/certbot:latest
    volumes:
      - certbot-www:/var/www/certbot
      - certbot-certs:/etc/letsencrypt
    profiles:
      - tools

volumes:
  pgdata:
  uploads:
  certbot-www:
  certbot-certs:
```

### 6.6. `deploy/nginx/default.conf` (HTTP trước — để xin SSL)

```nginx
server {
    listen 80;
    server_name phuquocmaiphuong.com www.phuquocmaiphuong.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /uploads/ {
        alias /var/www/uploads/;
        access_log off;
        expires 7d;
    }

    location /api/ {
        proxy_pass http://api:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 12m;
    }

    location /actuator/ {
        proxy_pass http://api:8080/actuator/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 6.7. `deploy/nginx/default-ssl.conf` (dùng sau khi có chứng chỉ)

```nginx
server {
    listen 80;
    server_name phuquocmaiphuong.com www.phuquocmaiphuong.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name phuquocmaiphuong.com www.phuquocmaiphuong.com;

    ssl_certificate     /etc/letsencrypt/live/phuquocmaiphuong.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/phuquocmaiphuong.com/privkey.pem;

    location /uploads/ {
        alias /var/www/uploads/;
        access_log off;
        expires 7d;
    }

    location /api/ {
        proxy_pass http://api:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 12m;
    }

    location /actuator/ {
        proxy_pass http://api:8080/actuator/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 6.8. `deploy/.env.production.example`

```text
POSTGRES_DB=nuss
POSTGRES_USER=nuss
POSTGRES_PASSWORD=doi-mat-khau-db-rat-manh

JWT_SECRET=chuoi-dai-ngau-nhien-toi-thieu-32-ky-tu
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=doi-mat-khau-admin-manh

ONEPMS_SECRET_KEY=
ONEPMS_ACCOUNT=
ONEPMS_HOTEL_ID=LHr42guUNvCzeKu0R08y
ONEPMS_BASE_URL=https://us-central1-neutron-pms.cloudfunctions.net

# Same origin via Nginx — browser calls https://domain/api
NEXT_PUBLIC_API_BASE_URL=https://phuquocmaiphuong.com
NUSS_CORS_ORIGINS=https://phuquocmaiphuong.com,https://www.phuquocmaiphuong.com

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_FROM_NAME=Mai Phuong Resort
MAIL_RESORT_TO=
```

### 6.9. Push lên GitHub

Trên Windows:

```powershell
cd "C:\Users\binh.nh\Desktop\NUSS"
git add docker-compose.prod.yml deploy nuss-client/Dockerfile nuss-client/.dockerignore nuss-client/next.config.ts
git status
git commit -m "Add production Docker Compose and Nginx configs for VPS"
git push
```

Đảm bảo **không** commit file `.env` thật.

---

## 7. Clone code và cấu hình trên VPS

SSH vào VPS:

```bash
mkdir -p /opt/nuss
cd /opt/nuss
```

### 7.1. Clone repo private

Cách đơn giản (Personal Access Token):

1. GitHub → Settings → Developer settings → Personal access tokens → tạo token (scope `repo`).
2. Trên VPS:

```bash
git clone https://github.com/datpham196/maiphuong-resort.git .
```

Khi hỏi username/password: username = GitHub username, password = **token** (không phải mật khẩu GitHub).

> Cách đẹp hơn về sau: Deploy key SSH. Làm sau cũng được.

### 7.2. Tạo file môi trường production

```bash
cp deploy/.env.production.example .env
nano .env
```

Điền secret thật (copy từ `.env` local, **đổi** JWT/admin/DB password mạnh hơn).

Lưu trong `nano`: `Ctrl+O` → Enter → `Ctrl+X`.

### 7.3. Quyền file .env

```bash
chmod 600 .env
```

---

## 8. Chạy stack lần đầu

Vẫn trong `/opt/nuss`:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Lần đầu **rất lâu** (tải image + Maven build + `npm run build`) — có thể **10–25 phút**.

Xem log:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Thoát theo dõi log: `Ctrl+C` (không tắt container).

Kiểm tra container:

```bash
docker compose -f docker-compose.prod.yml ps
```

Các service `db`, `api`, `web`, `nginx` nên `running` / healthy.

Test từ VPS:

```bash
curl -I http://127.0.0.1/
curl -s http://127.0.0.1/actuator/health
```

Mở trình duyệt bằng **IP**:

```text
http://IP_CUA_VPS/
```

Thấy trang web (hoặc đang redirect) là stack đã lên. Domain chưa trỏ thì chưa vào bằng tên miền được.

---

## 9. Trỏ domain về VPS

### 9.1. Tìm nơi quản lý DNS

Đăng nhập chỗ đang giữ `phuquocmaiphuong.com` (nhà đăng ký / hosting cũ / Cloudflare).

### 9.2. Bản ghi DNS cần có

| Loại | Name / Host | Value | TTL |
|------|-------------|-------|-----|
| **A** | `@` (hoặc để trống / `phuquocmaiphuong.com`) | `IP_VPS` | 300 hoặc Auto |
| **A** | `www` | `IP_VPS` | 300 hoặc Auto |

- Xóa / tạm tắt bản ghi A/CNAME cũ trỏ về hosting cũ (nếu còn).  
- Đợi DNS lan (vài phút đến vài giờ; thường < 30 phút).

### 9.3. Kiểm tra DNS đã về VPS chưa

Trên Windows PowerShell:

```powershell
nslookup phuquocmaiphuong.com
nslookup www.phuquocmaiphuong.com
```

IP trả về phải **trùng IP VPS**.

### 9.4. (Khuyến nghị) Cloudflare

1. Đăng ký Cloudflare free → Add site `phuquocmaiphuong.com`.  
2. Đổi nameserver tại nhà đăng ký domain theo Cloudflare.  
3. Trên Cloudflare tạo 2 bản ghi A như trên.  
4. Lúc xin SSL Let's Encrypt: tạm để proxy **DNS only** (đám mây xám). Sau khi có SSL ổn có thể bật Proxy (cam) nếu muốn.

---

## 10. Bật HTTPS (Let's Encrypt)

Khi DNS đã trỏ đúng IP VPS:

```bash
cd /opt/nuss

docker compose -f docker-compose.prod.yml --profile tools run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d phuquocmaiphuong.com -d www.phuquocmaiphuong.com \
  --email EMAIL_CUA_BAN@example.com \
  --agree-tos --no-eff-email
```

Thành công sẽ có thư mục chứng chỉ trong volume certbot.

Đổi Nginx sang cấu hình SSL:

```bash
cp deploy/nginx/default-ssl.conf deploy/nginx/default.conf
docker compose -f docker-compose.prod.yml up -d nginx
```

Mở:

```text
https://phuquocmaiphuong.com
```

Trình duyệt phải có ổ khóa.

### Gia hạn SSL tự động (cron)

```bash
crontab -e
```

Thêm dòng (chạy 2 lần/ngày):

```cron
0 3,15 * * * cd /opt/nuss && docker compose -f docker-compose.prod.yml --profile tools run --rm certbot renew --quiet && docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload
```

---

## 11. Kiểm tra end-to-end

1. `https://phuquocmaiphuong.com` — trang chủ OK.  
2. `https://phuquocmaiphuong.com/vi/rooms` (hoặc route phòng của bạn) — có dữ liệu.  
3. `https://phuquocmaiphuong.com/actuator/health` — `UP` (nếu Nginx đã proxy; hoặc chỉ nội bộ).  
4. Admin: `https://phuquocmaiphuong.com/admin/login` — đăng nhập bằng user trong `.env`.  
5. Upload ảnh / sync OnePMS / đặt phòng thử.  
6. F12 → Network: API không lỗi CORS (cùng domain qua Nginx thường ổn).

Khi ổn định vài ngày → tắt hosting cũ / bản ghi DNS cũ.

---

## 12. Cách cập nhật code sau này

Trên Windows: sửa code → commit → push GitHub.

Trên VPS:

```bash
cd /opt/nuss
git pull
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Chỉ rebuild phần đổi:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build web
# hoặc
docker compose -f docker-compose.prod.yml --env-file .env up -d --build api
```

Xem log nếu lỗi:

```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
```

---

## 13. Backup database (bắt buộc nhớ)

### Backup thủ công

```bash
cd /opt/nuss
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U nuss nuss > /root/backup-nuss-$(date +%F).sql
```

Copy file `.sql` về máy Windows (WinSCP / `scp`) hoặc Google Drive.

### Gợi ý lịch hàng ngày

```bash
crontab -e
```

```cron
30 2 * * * cd /opt/nuss && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U nuss nuss | gzip > /root/backups/nuss-$(date +\%F).sql.gz
```

```bash
mkdir -p /root/backups
```

> Không backup = rủi ro mất toàn bộ CMS/booking nếu ổ VPS hỏng.

---

## 14. Checklist trước khi “chính thức”

- [ ] VPS SSD LINUX 3, Ubuntu, Docker OK  
- [ ] Repo có `docker-compose.prod.yml` + Nginx + Dockerfile client  
- [ ] File `/opt/nuss/.env` đủ secret, `chmod 600`  
- [ ] `docker compose ... ps` — db/api/web/nginx healthy  
- [ ] DNS A `@` và `www` → IP VPS  
- [ ] HTTPS Let's Encrypt OK  
- [ ] Đổi mật khẩu admin / JWT / DB mạnh  
- [ ] Test phòng, booking, admin, upload ảnh  
- [ ] Cron backup DB  
- [ ] (Tuỳ chọn) Cron renew SSL  
- [ ] Thông báo team URL chính thức  
- [ ] Tắt site cũ khi chắc chắn  

---

## 15. Lỗi thường gặp

### Không SSH được

- Sai IP / mật khẩu.  
- Firewall chặn cổng 22.  
- Dùng đúng `ssh root@IP`.

### `docker compose ... build` fail (hết RAM)

- 6GB thường đủ; nếu OOM: tạm dừng service khác, hoặc build từng phần (`--build api` rồi `web`).  
- Không chạy `npm run build` / Maven **trên host** song song lúc Docker build.

### Trang trắng / 502 Bad Gateway

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 api web nginx
```

Thường do `api` hoặc `web` chưa sẵn sàng — đợi thêm hoặc xem log Spring/Next.

### Domain chưa vào được VPS

- `nslookup` chưa ra IP mới → đợi DNS / xóa record cũ.  
- Cloudflare đang Proxy cam trong lúc xin SSL → tạm DNS only.

### Certbot fail

- DNS chưa trỏ đúng.  
- Cổng 80 chưa mở.  
- `server_name` trong Nginx phải đúng domain.

### Ảnh upload mất sau khi recreate

- Phải mount volume `uploads` (đã có trong compose mẫu).  
- Không xoá volume nếu không cố ý:  
  `docker compose ... down` **không** kèm `-v` thì volume còn; `down -v` sẽ xoá data.

### CORS lỗi

- Với setup Nginx cùng domain, browser gọi `/api` cùng origin → thường không cần CORS phức tạp.  
- Nếu vẫn gọi domain khác: sửa `NUSS_CORS_ORIGINS` trong `.env` rồi recreate `api`.

---

## Phụ lục A — Lệnh vận hành thường dùng

```bash
cd /opt/nuss

# Trạng thái
docker compose -f docker-compose.prod.yml ps

# Log
docker compose -f docker-compose.prod.yml logs -f --tail=200

# Restart 1 service
docker compose -f docker-compose.prod.yml restart api

# Dừng (giữ data)
docker compose -f docker-compose.prod.yml down

# Chạy lại
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

---

## Phụ lục B — Quan hệ với bản demo free

| Môi trường | Dùng để |
|------------|---------|
| Vercel + Render + Neon | Demo / staging cho khách xem trước |
| VPS + `phuquocmaiphuong.com` | **Production chính thức** |

Không bắt buộc tắt demo khi đã lên VPS — hai môi trường tách biệt là tốt.

---

## Bước tiếp theo ngay sau khi đọc xong

1. Thuê **VPS SSD LINUX 3** (Ubuntu) trên Vietnix.  
2. Nhờ AI / tự thêm các file mục 6 vào repo rồi `git push`.  
3. SSH vào VPS → làm từ mục 4 → 11 theo checklist.

Khi đã có **IP VPS**, gửi IP (không gửi mật khẩu trên chat công khai) để được hỗ trợ từng lệnh SSH tiếp theo.
