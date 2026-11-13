# nuss-backend

Spring Boot API for Mai Phương Resort. Room catalog syncs from OnePMS; CMS content is managed via `/api/admin/**`.

## Local setup

1. Start Postgres: `docker compose up -d`
2. Open `.env` in this folder and fill at least `ONEPMS_SECRET_KEY` and `ONEPMS_ACCOUNT`  
   (format account: `email:password`). Do not commit `.env`.
3. Run from `nuss-backend`: `mvnw.cmd spring-boot:run`  
   The app loads `.env` automatically; no PowerShell `$env:...` needed.

Default admin (bootstrap): `admin` / `admin123` unless overridden in `.env`.

## Useful endpoints

- `POST /api/admin/auth/login`
- `POST /api/admin/room-types/sync`
- `GET /api/admin/room-types`
- `GET /api/rooms?locale=vi`
