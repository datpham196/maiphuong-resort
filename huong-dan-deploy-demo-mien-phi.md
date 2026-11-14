# Hướng dẫn deploy demo miễn phí — NUSS (Mai Phương Resort)

Tài liệu này dành cho lần đầu đẩy dự án từ máy local lên internet để khách xem demo.

**Mục tiêu:** web chạy online, miễn phí, khoảng 2–3 người xem cùng lúc; mỗi lần bạn `git push` thì bản demo tự cập nhật.

**Kiến trúc đề xuất:**

```text
Máy bạn (code)
    │
    │  git push
    ▼
GitHub (1 repo chứa cả project)
    ├─► Vercel   → nuss-client (Next.js)     → https://xxx.vercel.app
    ├─► Render   → nuss-backend (Spring Boot) → https://xxx.onrender.com
    └─► Neon     → PostgreSQL (database)
```

**Chi phí:** $0 (free tier). Có giới hạn demo (cold start, upload tạm thời) — xem mục cuối.

> **Vercel Hobby + repo Private:** auto-deploy có thể bị Blocked nếu commit author không phải owner. Demo nên để repo **Public**, hoặc Redeploy bằng đúng account owner.

---

## Mục lục

1. [Bạn cần chuẩn bị gì trước](#1-bạn-cần-chuẩn-bị-gì-trước)
2. [Hiểu cấu trúc dự án hiện tại](#2-hiểu-cấu-trúc-dự-án-hiện-tại)
3. [Bước A — Chuẩn bị code để deploy được](#3-bước-a--chuẩn-bị-code-để-deploy-được)
4. [Bước B — Đẩy lên GitHub lần đầu](#4-bước-b--đẩy-lên-github-lần-đầu)
5. [Bước C — Tạo database Neon](#5-bước-c--tạo-database-neon)
6. [Bước D — Deploy backend lên Render](#6-bước-d--deploy-backend-lên-render)
7. [Bước E — Deploy frontend lên Vercel](#7-bước-e--deploy-frontend-lên-vercel)
8. [Bước F — Nối CORS và kiểm tra end-to-end](#8-bước-f--nối-cors-và-kiểm-tra-end-to-end)
9. [Cách cập nhật demo sau này](#9-cách-cập-nhật-demo-sau-này)
10. [Checklist nhanh](#10-checklist-nhanh)
11. [Lỗi thường gặp](#11-lỗi-thường-gặp)
12. [Giới hạn free tier cần biết khi demo khách](#12-giới-hạn-free-tier-cần-biết-khi-demo-khách)

---

## 1. Bạn cần chuẩn bị gì trước

### Tài khoản (miễn phí, đăng ký bằng GitHub cho nhanh)

| Dịch vụ | Link | Dùng để |
|--------|------|---------|
| GitHub | https://github.com | Lưu code, auto-deploy |
| Neon | https://neon.tech | PostgreSQL |
| Render | https://render.com | Chạy Spring Boot API |
| Vercel | https://vercel.com | Chạy Next.js |

### Phần mềm trên máy Windows

1. **Git** — mở PowerShell, gõ:

   ```powershell
   git --version
   ```

   Nếu báo không nhận lệnh: cài từ https://git-scm.com/download/win rồi mở lại terminal.

2. **GitHub CLI (tuỳ chọn)** hoặc dùng giao diện web GitHub — hướng dẫn bên dưới dùng **giao diện web + PowerShell**, không bắt buộc CLI.

3. Giữ sẵn file `nuss-backend/.env` local (đã có secret OnePMS, JWT…). **Không bao giờ commit file `.env`.** Khi deploy bạn sẽ copy giá trị vào dashboard Render/Vercel.

### Thông tin bạn sẽ điền dần (ghi ra giấy/note)

Sau khi làm xong từng bước, bạn sẽ có:

- URL GitHub repo: `https://github.com/<user>/nuss` (ví dụ)
- Neon JDBC URL + user + password
- Render backend URL: `https://xxxx.onrender.com`
- Vercel frontend URL: `https://xxxx.vercel.app`

---

## 2. Hiểu cấu trúc dự án hiện tại

Thư mục gốc trên máy (ví dụ):

```text
NUSS/
├── nuss-client/          ← Frontend Next.js (đã có git local, chưa có remote GitHub)
├── nuss-backend/         ← Backend Spring Boot + Postgres (chưa có git)
├── *.md                  ← Tài liệu thiết kế / tiến độ
└── huong-dan-deploy-demo-mien-phi.md   ← File này
```

**Cách làm khuyến nghị:** tạo **một repo GitHub duy nhất** ở thư mục `NUSS` (monorepo), chứa cả `nuss-client` và `nuss-backend`.  
Lý do: deploy Vercel/Render đều trỏ vào cùng một repo, chỉ khác **Root Directory**.

> Lưu ý: `nuss-client` hiện đã có `.git` riêng. Ở bước B ta sẽ gỡ `.git` của client để gộp vào repo gốc — code không bị mất, chỉ bỏ lịch sử git cũ của client nếu có.

---

## 3. Bước A — Chuẩn bị code để deploy được

Làm **trên máy local** trước khi đẩy GitHub. Nếu thiếu các file dưới đây, Render/Vercel sẽ build fail hoặc web không gọi được API.

### A1. Tạo `Dockerfile` cho backend

Tạo file mới:

`nuss-backend/Dockerfile`

Nội dung gợi ý (Java 21, JAR tên theo `pom.xml`):

```dockerfile
# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/nuss-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
# Render gán cổng qua biến PORT — bắt buộc lắng nghe PORT
ENTRYPOINT ["sh", "-c", "java -Xmx384m -jar app.jar --server.port=${PORT:-8080}"]
```

> Đã tạo sẵn file này trong repo (`nuss-backend/Dockerfile`).

### A2. Tạo `.dockerignore` cho backend (build nhanh hơn)

> Đã tạo sẵn `nuss-backend/.dockerignore`.

Tạo file (nếu chưa có):

`nuss-backend/.dockerignore`

```text
target/
.env
uploads/
*.log
.git
.idea
.vscode
```

### A3. Tạo `.gitignore` ở thư mục gốc `NUSS`

> Đã tạo sẵn `.gitignore` ở thư mục gốc `NUSS`.

Tạo file (nếu chưa có):

`NUSS/.gitignore`

```text
# OS / IDE
.DS_Store
Thumbs.db
.idea/
.vscode/
*.iml

# Logs
*.log
backend-run.log

# Secrets — never commit
**/.env
**/.env.local
**/.env.*.local

# Backend
nuss-backend/target/
nuss-backend/uploads/

# Frontend
nuss-client/node_modules/
nuss-client/.next/
nuss-client/out/
nuss-client/.vercel/
nuss-client/*.tsbuildinfo
```

### A4. Cho phép Next.js load ảnh từ backend Render

Đã cấu hình sẵn trong `nuss-client/next.config.ts` pattern `*.onrender.com` cho `/uploads/**` (kèm `localhost` cho dev).  
Nếu sau khi deploy ảnh vẫn không hiện, kiểm tra hostname cụ thể trên Render và chỉnh lại `remotePatterns` nếu cần.

### A5. (Tuỳ chọn) Health check

Backend đã mở `GET /actuator/health` (không cần login). Sau này dùng URL này để kiểm tra Render còn sống:

```text
https://your-backend.onrender.com/actuator/health
```

---

## 4. Bước B — Đẩy lên GitHub lần đầu

### B1. Tạo repository trống trên GitHub

1. Đăng nhập https://github.com
2. Góc phải trên → **+** → **New repository**
3. Điền:
   - **Repository name:** `nuss` (hoặc `maiphuong-resort`, tuỳ bạn)
   - **Private** (khuyến nghị — code + cấu hình nội bộ)
   - **Không** tick README / .gitignore / license (repo trống)
4. Bấm **Create repository**
5. Copy URL dạng: `https://github.com/<username>/nuss.git`

### B2. Gộp git về thư mục gốc `NUSS`

Mở PowerShell:

```powershell
cd "C:\Users\binh.nh\Desktop\NUSS"
```

Vì `nuss-client` đang có `.git` riêng, gỡ nó để dùng một repo gốc:

```powershell
Remove-Item -Recurse -Force ".\nuss-client\.git"
```

Khởi tạo git ở gốc:

```powershell
git init
git branch -M main
git add .
git status
```

**Kiểm tra kỹ `git status`:**

- **Không** thấy `nuss-backend/.env` hoặc `nuss-client/.env.local` trong danh sách sẽ commit.
- Nếu vẫn thấy → dừng lại, sửa `.gitignore`, chạy lại `git add .`.

Commit lần đầu:

```powershell
git commit -m "Initial commit: NUSS client and backend for demo deploy"
```

Gắn remote và đẩy lên (thay URL của bạn):

```powershell
git remote add origin https://github.com/<username>/nuss.git
git push -u origin main
```

Nếu GitHub hỏi đăng nhập: dùng Personal Access Token (Settings → Developer settings → Personal access tokens) hoặc đăng nhập qua trình duyệt Git Credential Manager.

### B3. Xác nhận trên GitHub

Mở repo trên web — phải thấy ít nhất:

- `nuss-client/`
- `nuss-backend/`
- `nuss-backend/Dockerfile`
- `.gitignore`

---

## 5. Bước C — Tạo database Neon

1. Vào https://neon.tech → Sign up (bằng GitHub cũng được)
2. **Create a project**
   - Name: `nuss-demo`
   - Region: chọn gần Singapore / Asia nếu có
   - Postgres version: mặc định ổn
3. Sau khi tạo, bấm **Connect** / **Connection details**
4. Chọn connection string kiểu **JDBC** hoặc lấy URI rồi chuyển sang JDBC

Neon thường cho dạng:

```text
postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

Spring Boot cần dạng:

```text
jdbc:postgresql://HOST/neondb?sslmode=require
```

Ghi lại 3 giá trị:

| Biến | Ví dụ |
|------|--------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | user Neon |
| `SPRING_DATASOURCE_PASSWORD` | password Neon |

> Bắt buộc có `sslmode=require` khi dùng Neon.

---

## 6. Bước D — Deploy backend lên Render

### D1. Tạo Web Service

1. Vào https://dashboard.render.com → Sign up / Login (dùng GitHub)
2. Cho phép Render truy cập repo `nuss` (nếu repo Private: Grant access)
3. **New +** → **Web Service**
4. Chọn repo `nuss` → **Connect**
5. Cấu hình:

| Field | Giá trị |
|-------|---------|
| Name | `nuss-backend` |
| Region | Singapore (nếu có) hoặc Oregon |
| Root Directory | `nuss-backend` |
| Runtime | **Docker** |
| Branch | `main` |
| Instance Type | **Free** |

6. Bấm **Create Web Service** (chưa cần lo lần build đầu nếu thiếu env — sẽ set env rồi redeploy).

### D2. Thêm Environment Variables trên Render

Vào service `nuss-backend` → **Environment** → thêm từng biến:

| Key | Value | Ghi chú |
|-----|--------|---------|
| `SPRING_DATASOURCE_URL` | JDBC Neon (có `sslmode=require`) | Từ bước C |
| `SPRING_DATASOURCE_USERNAME` | … | Từ Neon |
| `SPRING_DATASOURCE_PASSWORD` | … | Từ Neon |
| `JWT_SECRET` | chuỗi dài ngẫu nhiên ≥ 32 ký tự | Đừng dùng `change-me...` |
| `ADMIN_BOOTSTRAP_USERNAME` | `admin` | Hoặc đổi |
| `ADMIN_BOOTSTRAP_PASSWORD` | mật khẩu demo mạnh | Đổi khỏi `admin123` khi demo khách |
| `ONEPMS_SECRET_KEY` | copy từ `.env` local | |
| `ONEPMS_ACCOUNT` | copy từ `.env` local | dạng `email:password` |
| `ONEPMS_HOTEL_ID` | copy từ `.env` local | |
| `ONEPMS_BASE_URL` | `https://us-central1-neutron-pms.cloudfunctions.net` | |
| `NUSS_CORS_ORIGINS` | tạm `http://localhost:3000` | **Sẽ sửa lại** sau khi có URL Vercel |
| `NUSS_UPLOAD_DIR` | `uploads` | |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / … | nếu cần form liên hệ | Có thể bỏ trống nếu chưa demo mail |

Lưu → Render sẽ **Auto-Deploy** lại.

### D3. Đợi build xong và lấy URL

1. Tab **Logs**: lần đầu Docker + Maven có thể mất **5–15 phút**
2. Khi status **Live**, copy URL dạng:

   ```text
   https://nuss-backend-xxxx.onrender.com
   ```

3. Mở thử:

   ```text
   https://nuss-backend-xxxx.onrender.com/actuator/health
   ```

   Mong đợi JSON kiểu `{"status":"UP"}`.

> Free tier: nếu lâu không ai truy cập, service **sleep**. Request đầu tiên sau sleep có thể mất 30–60 giây — bình thường với demo free.

### D4. Auto-deploy backend

Trong Settings của Web Service, bật **Auto-Deploy** = Yes (mặc định thường đã bật).  
Từ giờ mỗi lần `git push` lên `main` (có thay đổi trong `nuss-backend/`), Render tự build lại.

---

## 7. Bước E — Deploy frontend lên Vercel

### E1. Import project

1. Vào https://vercel.com → Login bằng GitHub
2. **Add New…** → **Project**
3. Import repo `nuss`
4. Cấu hình:

| Field | Giá trị |
|-------|---------|
| Framework Preset | Next.js |
| Root Directory | `nuss-client` (bấm Edit → chọn folder) |
| Build Command | `npm run build` (mặc định) |
| Output | mặc định Next.js |
| Install Command | `npm install` |

### E2. Environment Variables trên Vercel

Trước khi Deploy, thêm:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://nuss-backend-xxxx.onrender.com` |

(Không thêm dấu `/` ở cuối.)

### E3. Deploy

1. Bấm **Deploy**
2. Đợi 1–3 phút
3. Copy URL dạng `https://nuss-xxxx.vercel.app`

### E4. Cập nhật `next.config.ts` (ảnh upload)

Nếu web có dùng ảnh từ `/uploads/**` của backend:

1. Sửa `hostname` Render trong `nuss-client/next.config.ts` (mục A4)
2. Commit + push:

   ```powershell
   cd "C:\Users\binh.nh\Desktop\NUSS"
   git add nuss-client/next.config.ts
   git commit -m "Allow Next.js images from Render backend"
   git push
   ```

3. Vercel tự deploy lại.

---

## 8. Bước F — Nối CORS và kiểm tra end-to-end

Frontend (Vercel) gọi API (Render) → backend phải cho phép origin Vercel.

### F1. Sửa CORS trên Render

Vào Render → `nuss-backend` → Environment → sửa:

```text
NUSS_CORS_ORIGINS=https://nuss-xxxx.vercel.app
```

Nếu cần vừa local vừa demo:

```text
NUSS_CORS_ORIGINS=https://nuss-xxxx.vercel.app,http://localhost:3000
```

**Không** thêm dấu `/` cuối URL.  
Sau khi Save, đợi Render redeploy xong.

### F2. Checklist kiểm thử

1. Mở `https://…vercel.app` — trang chủ load được.
2. Mở DevTools (F12) → tab Network: API gọi tới `onrender.com`, status 200 (không lỗi CORS).
3. Mở `https://…onrender.com/actuator/health` → `UP`.
4. Đăng nhập admin (nếu có trang admin) bằng user/password đã set trên Render.
5. Thử sync phòng OnePMS / xem danh sách phòng (tuỳ tính năng đã làm).

### F3. Thứ tự phụ thuộc (nhớ khi setup lại từ đầu)

```text
1. GitHub có code
2. Neon có DB
3. Render backend Live + env đúng
4. Vercel frontend trỏ đúng API URL
5. CORS trên Render trỏ đúng URL Vercel
```

---

## 9. Cách cập nhật demo sau này

Mỗi lần bạn sửa code:

```powershell
cd "C:\Users\binh.nh\Desktop\NUSS"
git add .
git status
git commit -m "Mo ta ngan goi thay doi"
git push
```

Điều gì xảy ra:

| Bạn sửa ở | Ai tự deploy |
|-----------|----------------|
| `nuss-client/...` | Vercel (thường 1–3 phút) |
| `nuss-backend/...` | Render (thường lâu hơn vì Docker/Maven) |
| Chỉ tài liệu `.md` ở gốc | Thường không ảnh hưởng site |

**Không cần** vào Vercel/Render bấm Deploy thủ công nếu Auto-Deploy đang bật.

Muốn xem lịch sử deploy:

- Vercel → Project → Deployments  
- Render → Service → Events / Logs  

---

## 10. Checklist nhanh

- [ ] Có tài khoản GitHub, Neon, Render, Vercel
- [ ] Có `nuss-backend/Dockerfile` và `.dockerignore`
- [ ] Có `.gitignore` gốc; **không** commit `.env`
- [ ] Repo GitHub monorepo chứa `nuss-client` + `nuss-backend`
- [ ] Neon: có JDBC URL + user + password (`sslmode=require`)
- [ ] Render: Free Web Service, Root = `nuss-backend`, Runtime Docker
- [ ] Render env đủ (DB, JWT, OnePMS, CORS)
- [ ] `/actuator/health` trả `UP`
- [ ] Vercel: Root = `nuss-client`, có `NEXT_PUBLIC_API_BASE_URL`
- [ ] CORS Render = URL Vercel
- [ ] `next.config.ts` cho phép hostname Render (nếu dùng ảnh upload)
- [ ] Demo mở trên điện thoại/ máy khác bằng URL Vercel được

---

## 11. Lỗi thường gặp

### Build Render fail: Maven / JAR not found

- Kiểm tra tên file JAR trong Dockerfile khớp `nuss-backend-0.0.1-SNAPSHOT.jar` (xem `pom.xml` → `artifactId` + `version`).
- Root Directory phải là `nuss-backend` (nơi có `Dockerfile` và `pom.xml`).

### Health check fail / app crash khi start

- Sai `SPRING_DATASOURCE_URL` (thiếu `jdbc:` hoặc thiếu `sslmode=require`).
- Sai user/password Neon.
- Xem **Logs** trên Render — đọc stack trace cuối cùng.

### Trang Vercel mở được nhưng không có dữ liệu / lỗi CORS

- `NUSS_CORS_ORIGINS` chưa đúng URL Vercel (hoặc còn `localhost` thôi).
- `NEXT_PUBLIC_API_BASE_URL` sai hoặc còn `http://localhost:8080`.
- Sau khi đổi env Vercel biến `NEXT_PUBLIC_*`, **bắt buộc Redeploy** (biến này được nhúng lúc build).

### Request đầu rất chậm (~1 phút)

- Render Free đang **wake up** sau khi sleep. Đây là hành vi free tier, không phải lỗi code.

### Ảnh upload biến mất sau vài lần deploy

- Free Web Service **không có ổ đĩa bền**. File trong `uploads/` mất khi instance tạo lại. Với demo: dùng ảnh URL ngoài, hoặc chấp nhận upload lại sau deploy.

### `git push` bị reject / auth fail

- Repo Private cần quyền; dùng HTTPS + Personal Access Token, hoặc SSH key đã thêm vào GitHub.

### Vercel build fail vì ESLint / TypeScript

- Xem log build trên Vercel; sửa lỗi trên local bằng `npm run build` trong `nuss-client` rồi push lại.

---

## 12. Giới hạn free tier cần biết khi demo khách

| Hiện tượng | Nguyên nhân | Cách xử lý khi demo |
|------------|-------------|---------------------|
| Lần mở đầu chậm 30–60s | Render sleep sau ~15 phút idle | Mở sẵn URL health trước khi khách vào; hoặc dùng UptimeRobot ping mỗi 10 phút |
| DB Neon “ngủ” rồi thức dậy | Neon scale-to-zero | Giống trên — request đầu hơi chậm |
| Upload ảnh không bền | Không có persistent disk free | Ưu tiên ảnh CDN / Unsplash cho demo |
| Render Postgres free hết sau 30 ngày | Nếu lỡ dùng Render DB | Tài liệu này dùng **Neon** để tránh hết hạn nhanh |
| Vercel Hobby | Chủ yếu personal / demo non-commercial | Đủ cho preview khách |

---

## Phụ lục — Biến môi trường tham chiếu

### Backend (Render) — map từ `nuss-backend/.env.example`

```text
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
JWT_SECRET=
ADMIN_BOOTSTRAP_USERNAME=
ADMIN_BOOTSTRAP_PASSWORD=
ONEPMS_SECRET_KEY=
ONEPMS_ACCOUNT=
ONEPMS_HOTEL_ID=
ONEPMS_BASE_URL=
NUSS_CORS_ORIGINS=
NUSS_UPLOAD_DIR=uploads
```

### Frontend (Vercel) — map từ `nuss-client/.env.example`

```text
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
```

---

## Bước tiếp theo (khi bạn sẵn sàng)

Khi đọc xong và muốn làm thật trên máy, có thể nhờ AI hỗ trợ lần lượt:

1. Tạo sẵn `Dockerfile`, `.dockerignore`, `.gitignore` gốc trong repo  
2. Hướng dẫn từng lệnh `git` cụ thể với tên repo bạn chọn  
3. Soát env trước khi bấm Deploy  

**Không cần làm hết một ngày** — thứ tự an toàn: GitHub → Neon → Render (health OK) → Vercel → CORS.
