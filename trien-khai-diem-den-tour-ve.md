# Triển khai chức năng Điểm đến / các tour / vé khu vui chơi

Tài liệu đặc tả và kế hoạch triển khai cho mục menu **Điểm đến / các tour / vé khu vui chơi** (route công khai `/experiences`, quản trị `/admin/experiences`) tại Mai Phương Resort.

Tham chiếu:

- [kien-truc-web.md](kien-truc-web.md)
- [tien-do-du-an.md](tien-do-du-an.md)
- Pattern đã có: module phòng (`nuss-backend` + `nuss-client` rooms / admin rooms)

---

## 1. Mục tiêu

Khách xem ba nhóm nội dung trên cùng một trang công khai:

| Nhóm | Mã (`group`) | Ý nghĩa |
|---|---|---|
| Điểm đến | `destination` | Địa điểm gợi ý quanh đảo / gần resort |
| Tour | `tour` | Hành trình trong ngày (lịch trình, thời lượng, giá giới thiệu) |
| Vé khu vui chơi | `ticket` | Thông tin vé / hoạt động (giá, điều kiện) |

Nhân viên resort tự **thêm / sửa / ẩn / sắp thứ tự** từng mục và **thêm / thay / xóa / sắp ảnh** trong khu quản trị, không cần sửa code. Trang công khai **không hardcode ảnh**.

**Không làm trong bước này:** giỏ hàng, thanh toán, đặt tour/vé online, đồng bộ PMS.

### 1.1. Nhóm nội dung (`group`) vs layout hiển thị (`layout`)

Bản nháp đầu gắn UI chi tiết theo `group` (destination/tour/ticket) trên **một** trang detail dùng chung, chỉ bật/tắt vài block field.

**Hướng chốt:** dùng **khoảng 3 layout content** cố định trên client. Khi tạo/sửa bài ở admin, nhân viên **chọn layout**. Client detail render đúng component layout đó.

| Khái niệm | Vai trò | Ai chọn |
|---|---|---|
| `experience_group` | Phân loại nội dung (lọc list: Điểm đến / Tour / Vé) | Admin khi tạo bài |
| `layout` | Khuôn trình bày trang chi tiết | Admin khi tạo/sửa bài (độc lập hoặc gợi ý theo group) |

Như vậy:

- List `/experiences` vẫn chia 3 nhóm theo `group`.
- Detail `/experiences/[slug]` **không** chỉ là 1 layout dùng chung; mà switch theo `layout` trả về từ API.
- Có thể 2 bài cùng group `tour` nhưng khác layout (vd. nhiều ảnh vs nhấn lịch trình).

Ba layout đề xuất (mã cố định trong code):

| Mã `layout` | Tên gợi ý | Bố cục chính |
|---|---|---|
| `story` | Bài giới thiệu / điểm đến | Hero ảnh lớn → chữ dài → gallery phụ |
| `itinerary` | Tour / hành trình | Cover + tóm tắt → lịch trình từng bước → thời lượng / giá → gallery |
| `ticket` | Vé / điều kiện | Cover + giá nổi → điều kiện → mô tả → gallery |

Có thể đổi tên mã sau, nhưng **không** để admin tự nhập HTML layout tự do ở bước này (tránh XSS và lệch thiết kế). Layout = enum chọn sẵn.

---

## 2. Hiện trạng (đã phân tích)

### 2.1. Đã có trên client

- Menu header / drawer trỏ tới `/experiences`.
- Homepage section `#experiences` với **2 card Unsplash + i18n cứng**.
- Feature slider và trang About có link sang `/experiences`.
- i18n label menu trong `messages/vi.json`, `messages/en.json`.

### 2.2. Chưa có

| Lớp | Thiếu |
|---|---|
| Client công khai | `app/[locale]/experiences/`, `[slug]/`, `services/experiences.ts`, styles, namespace i18n `Experiences` |
| Client admin | `/admin/experiences`, form tạo/sửa, quản lý ảnh, mục nav trong `admin-shell` |
| Backend | Package `experiences`, entity, Flyway, API public/admin, seed |

Hệ quả: click menu hoặc “Xem thêm” → `/experiences` **404**.

### 2.3. Pattern tái sử dụng từ Rooms

**Nên copy ý tưởng:**

- Nội dung theo locale (`vi` / `en`) + `slug` + `isPublished` + `displayOrder`.
- Ảnh cover + gallery; upload multipart; URL `/uploads/...`.
- Public list/detail theo `locale` và `slug`.
- Admin JWT (`/api/admin/...`).

**Không copy nguyên xi:**

- Sync OnePMS / `externalId` / availability.
- Rooms chỉ “bổ sung content” trên bản ghi PMS; Experiences phải **tạo bản ghi 100% từ CMS**.

---

## 3. Mô hình dữ liệu

Đề xuất 3 bảng, cùng hướng với `room_types` / `room_contents` / `room_images`.

### 3.1. `experiences`

Bản ghi gốc (không phụ thuộc PMS).

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID PK | |
| `experience_group` | VARCHAR(20) NOT NULL | `destination` \| `tour` \| `ticket` |
| `layout` | VARCHAR(30) NOT NULL | `story` \| `itinerary` \| `ticket` — khuôn trang chi tiết |
| `display_order` | INT NOT NULL DEFAULT 0 | Thứ tự trong nhóm |
| `is_active` | BOOLEAN NOT NULL DEFAULT TRUE | Soft-disable cấp bản ghi |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

Constraint:

- `experience_group IN ('destination','tour','ticket')`
- `layout IN ('story','itinerary','ticket')`

Gợi ý mặc định khi tạo bài (admin vẫn đổi được):

| Group mới chọn | Layout mặc định |
|---|---|
| `destination` | `story` |
| `tour` | `itinerary` |
| `ticket` | `ticket` |

### 3.2. `experience_contents`

Nội dung đa ngôn ngữ (1 dòng / locale).

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID PK | |
| `experience_id` | UUID FK → experiences | |
| `locale` | VARCHAR(10) NOT NULL | `vi` \| `en` |
| `slug` | VARCHAR(255) | Unique theo locale khi khác null |
| `title` | VARCHAR(255) | Tên hiển thị |
| `short_description` | TEXT | Chú thích thẻ list / homepage |
| `description` | TEXT | Mô tả chi tiết trang slug |
| `itinerary` | TEXT | **Tour:** lịch trình |
| `duration_text` | VARCHAR(100) | **Tour:** thời lượng (vd. “4 giờ”, “1 ngày”) |
| `price_amount` | NUMERIC(12,2) | **Tour / vé:** giá giới thiệu (nullable) |
| `price_currency` | VARCHAR(10) DEFAULT `VND` | |
| `price_note` | VARCHAR(255) | Ghi chú giá (vd. “/ người”) |
| `conditions` | TEXT | **Vé:** điều kiện sử dụng |
| `seo_title` / `seo_description` | | SEO tùy chọn |
| `is_published` | BOOLEAN NOT NULL DEFAULT FALSE | Chỉ bản publish mới ra public |
| `created_at` / `updated_at` | | |

Unique: `(experience_id, locale)`.  
Unique partial: `(locale, slug) WHERE slug IS NOT NULL`.

Quy ước field theo nhóm:

| Field | destination | tour | ticket |
|---|---|---|---|
| title, short_description, description, ảnh | bắt buộc khi publish | bắt buộc | bắt buộc |
| itinerary, duration_text | bỏ trống | khuyến nghị | bỏ trống |
| price_* | tùy chọn | khuyến nghị | khuyến nghị |
| conditions | bỏ trống | tùy chọn | khuyến nghị |

### 3.3. `experience_images`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID PK | |
| `experience_id` | UUID FK | |
| `image_url` | TEXT NOT NULL | Public URL `/uploads/...` |
| `storage_key` | TEXT NOT NULL | Key lưu file |
| `alt_text` | VARCHAR(255) | |
| `display_order` | INT NOT NULL DEFAULT 0 | |
| `is_cover` | BOOLEAN NOT NULL DEFAULT FALSE | Một cover / experience |
| `created_at` | TIMESTAMPTZ | |

Unique partial: một `is_cover = TRUE` mỗi `experience_id`.

### 3.4. Migration & seed

- File Flyway mới, ví dụ `V4__experiences.sql` (đánh số theo migration hiện có).
- Seed tối thiểu: **1 destination + 1 tour + 1 ticket**, mỗi cái có content `vi` (và ideally `en`), cover image (có thể dùng ảnh tạm trong `/uploads` hoặc URL placeholder có kiểm soát).

---

## 4. API Backend

Base path thực tế dự án: `/api/...` (khớp rooms). Package Java: `com.maiphuong.nuss.experiences` (cùng style package hiện tại, không bắt buộc `modules/`).

### 4.1. Public (không JWT)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/experiences?locale=&group=` | List đã publish + active, sort `display_order`. `group` tùy chọn để lọc |
| GET | `/api/experiences/{slug}?locale=` | Chi tiết + gallery; 404 nếu ẩn / chưa publish |

**Response list item (gợi ý):**

```json
{
  "id": "uuid",
  "group": "tour",
  "layout": "itinerary",
  "slug": "tour-hon-mong-tay",
  "title": "...",
  "shortDescription": "...",
  "durationText": "4 giờ",
  "priceAmount": 890000,
  "priceCurrency": "VND",
  "priceNote": "/ người",
  "coverImage": { "id": "uuid", "url": "/uploads/...", "altText": "..." },
  "displayOrder": 1
}
```

**Response detail:** như trên + `description`, `itinerary`, `conditions`, `images[]`. Client **bắt buộc** đọc `layout` để chọn component.

### 4.2. Admin (JWT, prefix `/api/admin`)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/experiences` | List tất cả (kèm trạng thái publish từng locale) |
| POST | `/experiences` | Tạo mới (`group` + `layout` + content locale đầu) |
| GET | `/experiences/{id}` | Chi tiết admin |
| PUT | `/experiences/{id}` | Sửa `group`, `layout`, displayOrder, isActive |
| PUT | `/experiences/{id}/contents/{locale}` | Upsert nội dung locale |
| POST | `/experiences/{id}/contents/{locale}/publish` | Publish (validate title + slug) |
| POST | `/experiences/{id}/contents/{locale}/unpublish` | Unpublish |
| PUT | `/experiences/reorder` | Body `{ orderedIds: UUID[] }` (hoặc theo group) |
| POST multipart | `/experiences/{id}/images` | Upload; query `altText`, `asCover` |
| PUT | `/experiences/{id}/images/reorder` | `{ orderedIds }` |
| PUT | `/experiences/{id}/images/{imageId}/cover` | Đặt cover |
| DELETE | `/experiences/{id}/images/{imageId}` | Xóa ảnh (+ file storage) |
| DELETE | `/experiences/{id}` | Xóa mềm hoặc cứng (chốt: soft via `is_active=false` ưu tiên) |

### 4.3. Bảo mật & upload

- `SecurityConfig`: mở `GET /api/experiences/**`; admin vẫn JWT.
- Tái sử dụng / tách `ImageStorageService`: path `experiences/{experienceId}/{uuid}.ext`.
- Giới hạn file: JPEG/PNG/WebP, max theo `application.yml` (rooms đang 8MB).

### 4.4. Validate publish

Publish locale chỉ thành công khi có:

1. `title` không trống  
2. `slug` hợp lệ, unique trong locale  
3. Nên có ít nhất 1 ảnh cover (khuyến nghị bắt buộc để khớp UX “cập nhật bằng hình ảnh”)

---

## 5. Client công khai

### 5.1. Routes

| Route | File đề xuất | Nội dung |
|---|---|---|
| `/[locale]/experiences` | `nuss-client/src/app/[locale]/experiences/page.tsx` | Hero ngắn + 3 section theo group |
| `/[locale]/experiences/[slug]` | `.../experiences/[slug]/page.tsx` | Switch 1 trong 3 layout theo `layout` |

### 5.2. Service

`nuss-client/src/services/experiences.ts`:

- `fetchPublicExperiences(locale, group?)`
- `fetchPublicExperience(slug, locale)`

Gọi backend qua cùng helper API đã dùng cho rooms.

### 5.3. UI list

- Ba khối: Điểm đến / Tour / Vé khu vui chơi.
- Mỗi thẻ: cover, title, shortDescription, CTA “Xem chi tiết”.
- Tour/vé có thể hiện thêm `durationText` / giá giới thiệu trên thẻ.
- Empty state khi nhóm chưa có mục publish.

### 5.4. UI detail (3 layout)

Trang `[slug]` fetch detail rồi render theo `layout`:

```text
switch (layout) {
  case 'story':      → <ExperienceLayoutStory />
  case 'itinerary':  → <ExperienceLayoutItinerary />
  case 'ticket':     → <ExperienceLayoutTicket />
  default:           → <ExperienceLayoutStory /> // fallback an toàn
}
```

Đề xuất thư mục component:

- `nuss-client/src/components/experiences/experience-layout-story.tsx`
- `nuss-client/src/components/experiences/experience-layout-itinerary.tsx`
- `nuss-client/src/components/experiences/experience-layout-ticket.tsx`

Mỗi layout đọc chung một kiểu dữ liệu detail (field thừa thì bỏ qua). Ví dụ:

- `story`: nhấn mạnh description + gallery.
- `itinerary`: nhấn mạnh itinerary / duration / price.
- `ticket`: nhấn mạnh price + conditions.

Gallery/lightbox dùng chung helper nếu cần. Không nút thanh toán; CTA phụ có thể là “Liên hệ”.

### 5.5. Homepage

Thay mảng Unsplash cứng trong `page.tsx` bằng dữ liệu API (ví dụ 2–4 mục mới nhất / nổi bật từ `GET /api/experiences?locale=`), giữ layout section hiện có + “Xem thêm →”.

### 5.6. i18n

Thêm namespace `Experiences` trong `messages/vi.json` và `en.json` (tiêu đề trang, tên 3 nhóm, nhãn field tour/vé, empty, lỗi 404).

### 5.7. Styles

`nuss-client/src/styles/experiences.css` — bám Ocean & Sand (`--ocean`, `--cream`, `--sand`, `--ink`), tránh card thừa trong hero nếu có hero riêng.

---

## 6. Client admin

### 6.1. Routes

| Route | Việc |
|---|---|
| `/admin/experiences` | Bảng/list theo group; nút tạo mới; ẩn/hiện nhanh |
| `/admin/experiences/new` hoặc modal tạo | Chọn group + title/slug locale |
| `/admin/experiences/[id]` | Form content vi/en, publish, upload/reorder/cover/xóa ảnh |

### 6.2. Nav

Thêm mục “Điểm đến / tour / vé” vào [admin-shell.tsx](nuss-client/src/components/admin-shell.tsx).

### 6.3. Service

`nuss-client/src/services/admin-experiences.ts` — mirror `admin-rooms.ts` nhưng có `create` và không có sync PMS.

### 6.4. UX form: chọn group + layout

Khi **tạo bài** / sửa metadata:

1. Chọn **nhóm** (`destination` | `tour` | `ticket`) — quyết định bài nằm section nào trên list.
2. Chọn **layout** (`story` | `itinerary` | `ticket`) — quyết định khuôn trang chi tiết. Hiện 3 ô preview nhỏ (mô tả ngắn hoặc sketch) để nhân viên hiểu khác nhau chỗ nào.
3. Đổi group có thể gợi ý layout mặc định; **không** tự ghi đè nếu user đã chọn layout khác.

Form nội dung (theo locale):

- Luôn hiện: title, slug, shortDescription, description, SEO.
- Hiện thêm khi layout/`group` cần: itinerary, durationText, price*, conditions (có thể hiện theo layout đang chọn để khớp UI public).
- Tab hoặc switch locale `vi` / `en`.
- Khối ảnh: cover + gallery (giống admin rooms).

### 6.5. Tiêu chí nghiệm thu admin (theo tiến độ dự án)

Nhân viên đăng nhập → tạo 1 điểm đến, 1 tour, 1 vé → upload ảnh → publish → thấy đúng trên `/experiences` và `/experiences/:slug` mà **không sửa code**.

---

## 7. Luồng dữ liệu

```text
Nhân viên (/admin/experiences)
        |
        | JWT CRUD + upload ảnh
        v
nuss-backend experiences module
        |
        +-- PostgreSQL (experiences / contents / images)
        +-- disk /uploads/experiences/...
        |
        | GET public
        v
nuss-client /experiences (+ homepage preview)
```

---

## 8. Thứ tự triển khai đề xuất

### Bước A — Backend foundation

1. Flyway `V4__experiences.sql` + seed tối thiểu.  
2. Entities, repositories, DTOs.  
3. `ExperienceAdminService` + `PublicExperienceQueryService`.  
4. Controllers public + admin.  
5. Mở `SecurityConfig`; generalize storage path.  
6. Test API bằng Postman / curl (list, detail, publish, upload).

### Bước B — Admin UI

1. Nav + list page.  
2. Create + edit content (vi/en) + publish.  
3. Image upload / delete / cover / reorder.  
4. Kiểm tra vòng đời: draft → publish → unpublish → ẩn bản ghi.

### Bước C — Public UI

1. Service + list page 3 nhóm.  
2. Detail `[slug]` theo group.  
3. i18n + CSS.  
4. Gắn homepage section lấy API.  
5. Xử lý 404 slug / empty group.

### Bước D — Hoàn thiện

1. SEO metadata từ `seoTitle` / `seoDescription`.  
2. Kiểm tra responsive mobile.  
3. Cập nhật `tien-do-du-an.md` đánh dấu hạng mục đã xong.  
4. (Tùy chọn) bỏ Unsplash khỏi homepage experiences.

---

## 9. Tiêu chí Done

- [x] `GET /api/experiences` và `GET /api/experiences/{slug}` trả dữ liệu publish theo locale.  
- [x] Admin tạo được destination / tour / ticket, sửa 2 locale, publish/unpublish.  
- [x] Admin quản lý được bộ ảnh (cover + gallery).  
- [x] `/experiences` hiện 3 nhóm từ API, không hardcode ảnh.  
- [x] `/experiences/[slug]` render đúng 1 trong 3 layout theo field `layout` từ API.
- [x] Admin tạo/sửa được bài và chọn được `group` + `layout`.  
- [x] Homepage preview lấy từ API.  
- [x] Bản ẩn / chưa publish không lộ trên public.  
- [x] Không có thanh toán / đặt tour trong phạm vi này.

> Triển khai code lần đầu: 2026-11-12. Cần restart backend để Flyway `V4__experiences.sql` chạy; upload ảnh cover qua admin để homepage/list đẹp hơn (seed chưa có file ảnh).

---

## 10. Rủi ro & lưu ý

| Rủi ro | Cách xử lý |
|---|---|
| Nhầm với rooms (có PMS) | Experiences là CMS thuần; không gắn OnePMS |
| `ImageStorageService` hardcode `rooms/` | Tách tham số folder hoặc shared service trước khi làm upload experiences |
| Slug trùng giữa group | Unique theo `(locale, slug)` toàn cục — đủ; không cần unique theo group |
| Giá thay đổi theo ngày | Chỉ lưu giá giới thiệu; ghi chú rõ trên UI |
| Nội dung dài field tour | `itinerary` / `conditions` dùng TEXT; UI textarea |

---

## 11. File sẽ tạo / chỉnh (checklist)

### Backend

- `nuss-backend/src/main/resources/db/migration/V4__experiences.sql`
- `.../experiences/entity/Experience.java`
- `.../experiences/entity/ExperienceContent.java`
- `.../experiences/entity/ExperienceImage.java`
- `.../experiences/repo/*`
- `.../experiences/dto/*`
- `.../experiences/service/*`
- `.../experiences/web/PublicExperienceController.java`
- `.../experiences/web/AdminExperienceController.java`
- `SecurityConfig.java` (permit GET experiences)
- `ImageStorageService` (path experiences)

### Client

- `nuss-client/src/app/[locale]/experiences/page.tsx`
- `nuss-client/src/app/[locale]/experiences/[slug]/page.tsx`
- `nuss-client/src/app/admin/experiences/page.tsx`
- `nuss-client/src/app/admin/experiences/[id]/page.tsx`
- `nuss-client/src/services/experiences.ts`
- `nuss-client/src/services/admin-experiences.ts`
- `nuss-client/src/styles/experiences.css`
- `nuss-client/src/components/admin-shell.tsx`
- `nuss-client/src/app/[locale]/page.tsx` (homepage)
- `nuss-client/messages/vi.json`, `en.json`

---

*Tài liệu này là bản triển khai chi tiết cho một mục menu. Khi code xong từng bước, cập nhật checklist mục 9 và tiến độ trong `tien-do-du-an.md`.*
