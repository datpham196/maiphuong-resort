# Kiến trúc trang Phòng — OnePMS Sync + Room Content CMS

Tài liệu này chốt cách dựng mục menu **Phòng** cho website Mai Phương Resort. Tham chiếu [kien-truc-web.md](kien-truc-web.md), [tien-do-du-an.md](tien-do-du-an.md) và [TÍCH HỢP ONEPMS API 3.4.md](TÍCH%20HỢP%20ONEPMS%20API%203.4.md).

**Công nghệ:** `nuss-client` (Next.js / React), `nuss-backend` (Java 21 / Spring Boot 3), PostgreSQL.  
**PMS:** OnePMS.  
**Property đã xác nhận qua API:** Mai Phương Resort Phú Quốc — `hotelID = LHr42guUNvCzeKu0R08y`.

---

## 1. Mục tiêu

Trang Phòng hiện đủ ảnh, mô tả, tiện nghi để khách xem và đặt, nhưng:

- OnePMS chỉ trả thuộc tính nghiệp vụ của hạng phòng, không có gallery và mô tả marketing.
- Website không gọi OnePMS mỗi lần khách mở `/rooms`.
- OnePMS vẫn là sổ cái cho tồn phòng và tạo booking.

### 1.1. Kiến trúc chọn

**OnePMS Sync + Local Room Catalog + Room Content CMS**

1. Backend đồng bộ hạng phòng từ OnePMS vào PostgreSQL.
2. Admin bổ sung ảnh, mô tả, tiện nghi, publish trên cùng bản ghi local.
3. Trang công khai chỉ đọc DB NUSS.
4. Khi khách chọn ngày hoặc đặt phòng, backend mới gọi OnePMS.

```text
OnePMS API
   |
   | sync định kỳ / nút Admin
   v
nuss-backend  ----->  PostgreSQL
   |                    room_types       (bản sao từ OnePMS)
   |                    room_contents    (CMS vi/en)
   |                    room_images
   |                    pms_sync_runs
   |
   +-- Public API  -->  nuss-client  (/rooms, /rooms/:slug)
   +-- Admin API   -->  nuss-client  (/admin/rooms)
   +-- [khi đặt]   -->  OnePMS checkAvailabilityAndRate + addBooking
```

### 1.2. Phân tách nguồn sự thật

| Nhóm dữ liệu | Ví dụ | Nguồn chuẩn |
|---|---|---|
| Định danh hạng phòng | `roomTypeID` | OnePMS |
| Tên hạng, sức chứa, giường, giá niêm yết, số phòng của hạng | `name`, `guest`, `beds`, `price`, `num` | OnePMS → sync vào `room_types` |
| Tiêu đề web, mô tả, tiện nghi, SEO, thứ tự, publish | content CMS | DB NUSS / Admin |
| Ảnh cover và gallery | URL, alt, thứ tự | Storage + `room_images` |
| Phòng trống và giá theo ngày | `amount`, `dailyRates` | OnePMS lúc tra cứu |
| Đặt / hủy phòng | `bookingIDs`, `bookingReference` | OnePMS lúc xác nhận |

Không dùng catalog đã sync để khẳng định còn phòng hay giá đặt tại thời điểm khách bấm đặt.

### 1.3. Không chọn

- Gọi `getRoomTypes` + đọc CMS rồi ghép mỗi lần khách mở trang: chậm, phụ thuộc uptime OnePMS.
- Admin tự tạo list phòng không khóa `roomTypeID`: dễ lệch sổ OnePMS.

---

## 2. OnePMS — API dùng cho trang Phòng

Base: `https://us-central1-neutron-pms.cloudfunctions.net/`  
Method: `POST`  
Header: `Authentication` = `CryptoJS.AES.encrypt("email:password", secretKey)`, `Content-Type: application/json`, `Accept-Language: vi|en`

| Việc | Endpoint | Body chính | Dùng khi |
|---|---|---|---|
| Lấy `hotelID` | `api-fetchHotelList` | `hotelIDs: []` | Setup / kiểm tra cấu hình |
| Đồng bộ catalog | `api-getRoomTypes` | `hotelID` | Sync scheduled / manual |
| (Tuỳ chọn) phòng vật lý | `api-getRooms` | `hotelID`, `roomTypeID` | Không dùng cho list web |
| Tồn + giá theo ngày | `api-checkAvailabilityAndRate` | `hotelID`, `roomTypeIDs`, `arrivalDate`, `departureDate` | Form tìm / trước khi đặt |
| Tạo booking | `api-addBooking` | khách + ngày + `rooms[].roomTypeID` + `rates` | Khi khách xác nhận |
| Hủy booking | `api-cancelBooking` | `bookingIDs`, `bookingReference` | Giai đoạn sau nếu web cho hủy |

### 2.1. Mapping `api-getRoomTypes` → local

Response OnePMS (đã test): mỗi phần tử có ít nhất:

| Field OnePMS | Cột local | Ghi chú |
|---|---|---|
| `roomTypeID` | `room_types.external_id` | Khóa sync. Không dùng tên làm khóa |
| `name` | `room_types.name` | Có thể khác title CMS |
| `guest` | `room_types.max_occupancy` | Sức chứa tối đa |
| `beds` | `room_types.beds_json` | JSON danh sách giường |
| `price` | `room_types.rack_rate` | Giá niêm yết / tham khảo trên list |
| `num` | `room_types.inventory_count` | Tổng số phòng của hạng, không phải tồn theo ngày |

Toàn bộ object gốc lưu thêm vào `room_types.pms_data` (JSONB) để audit. OnePMS không trả diện tích hay ảnh; không bịa field đó từ PMS.

### 2.2. Xác nhận đã có / còn mở

Đã xác nhận:

- Auth AES và quyền API của tài khoản resort chạy được.
- `hotelID` ổn định cho Mai Phương Resort Phú Quốc.
- `getRoomTypes` trả list hạng theo `hotelID`, không thấy pagination trong tài liệu 3.4.

Cần giữ trong vận hành:

- `roomTypeID` không đổi ý nghĩa giữa các lần sync. Nếu OnePMS đổi ID, không tự match theo tên; Admin map tay.
- Credentials chỉ nằm biến môi trường backend.

---

## 3. Flow tổng quát

### 3.1. Flow đồng bộ catalog

```text
[Scheduler 02:00 Asia/Ho_Chi_Minh]  hoặc  [Admin bấm Đồng bộ]
                |
                v
     Tạo pms_sync_runs status=RUNNING
                |
                v
     PmsClient: AES auth → api-getRoomTypes(hotelID)
                |
        +-------+--------+
        | lỗi / schema sai |
        v                |
   FAILED, giữ catalog   |
   hiện tại              |
                         v
              Snapshot hợp lệ trong memory
                         |
                         v
              Transaction:
                - upsert theo external_id (= roomTypeID)
                - cập nhật field PMS-owned + last_seen_at
                - không đụng room_contents / room_images
                - hạng vắng mặt trong snapshot đầy đủ → is_active=false (theo policy mục 6)
                         |
                         v
              SUCCESS + số created/updated/deactivated
```

### 3.2. Flow khách trên website

```text
Khách mở /rooms
   → Next.js gọi GET /api/rooms?locale=vi|en
   → Backend chỉ đọc PostgreSQL (active + published)
   → Trả list: ảnh cover, title, shortDescription, guest, rackRate, slug

Khách mở /rooms/:slug
   → GET /api/rooms/{slug}?locale=...
   → Chi tiết + gallery + amenities + CTA Đặt phòng

Khách chọn ngày trên /booking (hoặc widget trên trang phòng)
   → POST /api/rooms/availability
   → Backend gọi api-checkAvailabilityAndRate
   → Trả amount + dailyRates theo roomTypeID
   → Hết phòng thì không cho chọn hạng đó

Khách xác nhận đặt
   → POST /api/bookings
   → Backend gọi lại checkAvailabilityAndRate
   → Còn phòng → api-addBooking với đúng rates vừa nhận
   → result=00 → lưu mã OnePMS + hiện success
   → lỗi / hết phòng → không báo đặt thành công
```

Giai đoạn đầu, nếu chưa bật booking OnePMS trên production, form vẫn có thể lưu `BookingRequest` nội bộ như [kien-truc-web.md](kien-truc-web.md). Khi bật PMS, cùng form chuyển sang `addBooking`; catalog CMS không đổi.

### 3.3. Flow Admin

```text
Đăng nhập /admin
   → /admin/rooms : list mọi hạng đã sync (kể cả chưa publish)
   → Bấm Đồng bộ : POST sync, xem lần sync gần nhất
   → Chọn một hạng → sửa content vi/en, upload ảnh chính + gallery, publish
   → Chỉ hạng active + published mới ra /rooms
```

Admin **không** tạo hạng phòng mới ngoài OnePMS. Hạng mới chỉ xuất hiện sau sync.

---

## 4. Database

Bốn bảng. Khóa nghiệp vụ với OnePMS là `room_types.external_id` = `roomTypeID`.

### 4.1. ERD

```text
room_types 1──* room_contents
room_types 1──* room_images
pms_sync_runs (độc lập, lịch sử sync)
```

### 4.2. `room_types` — bản sao OnePMS

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UUID PK | ID nội bộ NUSS |
| `external_id` | VARCHAR UNIQUE | `roomTypeID` OnePMS |
| `hotel_id` | VARCHAR | `LHr42guUNvCzeKu0R08y` |
| `name` | VARCHAR | Tên từ OnePMS |
| `max_occupancy` | INT | `guest` |
| `beds_json` | JSONB | `beds` |
| `rack_rate` | NUMERIC | `price` tham khảo |
| `inventory_count` | INT | `num` |
| `pms_data` | JSONB | Payload gốc |
| `is_active` | BOOLEAN | Còn thấy trên OnePMS / còn dùng |
| `last_seen_at` | TIMESTAMPTZ | Lần sync gần nhất còn thấy |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

Sync chỉ ghi các cột trên. Không xóa row khi hạng biến mất khỏi OnePMS; chỉ `is_active = false` để giữ CMS.

### 4.3. `room_contents` — CMS theo locale

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UUID PK | |
| `room_type_id` | UUID FK | → `room_types.id` |
| `locale` | VARCHAR | `vi` hoặc `en` (khớp next-intl) |
| `slug` | VARCHAR | Unique theo locale, dùng URL `/rooms/:slug` |
| `title` | VARCHAR | Tiêu đề hiện trên web; trống thì fallback `room_types.name` |
| `short_description` | TEXT | Thẻ list |
| `description` | TEXT | Trang chi tiết |
| `amenities` | JSONB | Mảng chuỗi hoặc object `{label}` |
| `seo_title` / `seo_description` | VARCHAR/TEXT | |
| `display_order` | INT | Thứ tự list |
| `is_published` | BOOLEAN | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

Unique `(room_type_id, locale)`. Unique `(locale, slug)` khi slug không null.

### 4.4. `room_images`

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UUID PK | |
| `room_type_id` | UUID FK | |
| `image_url` | TEXT | URL public |
| `storage_key` | TEXT | Key để xóa/thay file |
| `alt_text` | VARCHAR | |
| `display_order` | INT | |
| `is_cover` | BOOLEAN | Tối đa một cover / room type |
| `created_at` | TIMESTAMPTZ | |

### 4.5. `pms_sync_runs`

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UUID PK | |
| `trigger` | VARCHAR | `SCHEDULED` \| `MANUAL` |
| `status` | VARCHAR | `RUNNING` \| `SUCCESS` \| `FAILED` |
| `started_at` / `finished_at` | TIMESTAMPTZ | |
| `total_fetched` / `created` / `updated` / `deactivated` | INT | |
| `error_message` | TEXT | Không chứa secret |

### 4.6. Quy tắc publish ra trang công khai

Một hạng xuất hiện trên `/rooms` khi:

1. `room_types.is_active = true`
2. Có `room_contents` với `locale` đang xem và `is_published = true`
3. Có slug
4. (Khuyến nghị) có ít nhất một ảnh cover (`is_cover = true`)

Backend enforce điều kiện publish; không chỉ ẩn nút trên UI.

Ảnh dùng **một bảng** `room_images`. Cover và gallery không tách bảng:
cover là bản ghi có `is_cover = true` (tối đa một / hạng phòng); các bản ghi còn lại là gallery.

---

## 5. Cơ chế sync

### 5.1. Thành phần backend

Trong module `rooms` / `pms` của `nuss-backend`:

| Component | Việc |
|---|---|
| `OnePmsAuthService` | Tạo header `Authentication` AES từ env |
| `OnePmsClient` | Gọi `fetchHotelList`, `getRoomTypes`, `checkAvailabilityAndRate`, `addBooking` |
| `RoomSyncService` | Orchestrate sync + ghi `pms_sync_runs` |
| `RoomContentService` | CRUD content, publish, ảnh |
| `RoomQueryService` | Public list/detail — **không** gọi OnePMS |
| `RoomAvailabilityService` | Gọi OnePMS khi tra cứu / trước đặt |
| `RoomSyncScheduler` | Cron mỗi ngày |

### 5.2. Scheduled sync

- Cron: `0 0 2 * * *`, zone `Asia/Ho_Chi_Minh`.
- Một resort, ít hạng phòng: sync đồng bộ trong request/job là đủ.
- Nhiều instance backend: dùng ShedLock (hoặc tương đương) để không chạy trùng.

### 5.3. Manual sync

- `POST /api/admin/room-types/sync` (cần đăng nhập admin).
- Chống chạy song song: nếu đang `RUNNING` thì trả lỗi rõ hoặc trả run hiện tại.
- Trả `syncRunId` + status để admin xem.

### 5.4. Thuật toán upsert

1. Tạo run `RUNNING`.
2. Gọi `api-getRoomTypes` với `hotelID` cấu hình.
3. `result != "00"` hoặc body không hợp lệ → `FAILED`, **không** sửa catalog.
4. Với mỗi item có `roomTypeID`:
   - Chưa có `external_id` → INSERT, `is_active=true`.
   - Đã có → UPDATE field PMS-owned + `pms_data` + `last_seen_at`; **giữ nguyên** contents/images.
5. Snapshot đã fetch thành công toàn bộ (OnePMS không pagination trong tài liệu hiện tại → một response = full list):
   - Các `room_types` active của `hotel_id` không có trong snapshot → `is_active=false`.
6. Không deactivate nếu response rỗng bất thường hoặc lỗi giữa chừng.
7. Commit + `SUCCESS`.

### 5.5. Lỗi sync

| Tình huống | Hành vi |
|---|---|
| Timeout / 5xx OnePMS | FAILED, giữ catalog |
| `001`/`002`/`003` auth | FAILED, cảnh báo cấu hình, không retry vô hạn |
| Schema thiếu `roomTypeID` | Bỏ record lỗi hoặc FAILED cả run (chốt khi implement: ưu tiên FAILED cả run nếu >0 record hỏng) |
| DB lỗi khi upsert | Rollback catalog, ghi FAILED |

Credentials: `ONEPMS_SECRET_KEY`, `ONEPMS_ACCOUNT` (`email:password`), `ONEPMS_HOTEL_ID` trong env backend.

---

## 6. Client công khai (`nuss-client`)

Đường dẫn đã chốt menu: `/rooms`, `/rooms/[slug]`. Locale qua `[locale]` hiện có (`vi` / `en`).

### 6.1. `/[locale]/rooms`

1. Server Component (hoặc fetch từ service) gọi backend `GET /api/rooms?locale=...`.
2. Render lưới thẻ phòng: cover, title, short description, sức chứa, giá tham khảo (`rack_rate`), CTA xem chi tiết / đặt.
3. Trạng thái: loading, rỗng (“Chưa có phòng hiển thị”), lỗi mạng.
4. Không gọi OnePMS từ browser.

### 6.2. `/[locale]/rooms/[slug]`

1. `GET /api/rooms/{slug}?locale=...`.
2. Gallery, mô tả, amenities, thông tin sức chứa / giường từ catalog.
3. Nút Đặt phòng → `/[locale]/booking?roomTypeId=...` hoặc `?slug=...`.
4. SEO: dùng `seo_title` / `seo_description` nếu có.

### 6.3. Đặt phòng (gắn sau catalog)

1. Form ngày đến / đi, số khách, hạng phòng (preselect từ slug).
2. Client gọi backend availability; backend gọi OnePMS.
3. Hiện giá từng đêm và còn/hết phòng.
4. Submit → backend check lại rồi `addBooking`.
5. Success chỉ khi OnePMS `result=00`.

### 6.4. Ràng buộc FE

- `external_id` / raw `pms_data` không cần hiện cho khách.
- Giá trên list là tham khảo từ sync; giá đặt theo ngày lấy từ availability API.
- Copy i18n nằm `messages/vi.json` và `en.json` cho label UI; nội dung phòng lấy từ CMS API.

---

## 7. Admin (`/admin/rooms`)

Cùng app Next.js, route group admin, API có session.

### 7.1. List

Hiển thị mọi hạng đã sync:

- Tên OnePMS, `external_id`
- `max_occupancy`, `rack_rate`, `is_active`
- CMS theo locale: Missing / Draft / Published
- `last_seen_at`, lần sync gần nhất
- Nút Sửa, nút Đồng bộ

### 7.2. Edit một hạng

Tab hoặc section theo `vi` / `en`:

- title, slug, short description, description
- amenities
- SEO
- display_order
- Lưu nháp / Xuất bản / Gỡ xuất bản
- **Xuất bản** và **Gỡ xuất bản** luôn lưu form hiện tại trước (upsert content), rồi mới đổi `is_published` — tránh mất nội dung vừa sửa nếu admin không bấm Lưu nháp

Ảnh — UI admin tách **2 mục upload**, model vẫn 1 bảng `room_images`:

1. **Ảnh chính (cover)** — đúng 1 ảnh; hiện trên list `/rooms` (và thumbnail). Nếu đã có cover thì disable upload; phải xóa cover hiện tại mới upload được (`asCover=true` bị BE từ chối khi cover đã tồn tại).
2. **Gallery** — nhiều ảnh (chọn nhiều file cùng lúc); hiện trên trang detail. Upload `asCover=false`, không auto-promote thành cover.

Chung:

- JPEG/PNG/WebP, giới hạn dung lượng
- Có thể đặt lại cover từ gallery (`PUT .../images/{imageId}/cover`), sắp thứ tự gallery, xóa
- Backend lưu file (local disk giai đoạn đầu hoặc object storage), ghi metadata `room_images`

### 7.3. Đồng bộ

- Nút “Đồng bộ từ OnePMS”
- Hiện trạng thái run: SUCCESS/FAILED, số tạo/cập nhật/tắt
- Hạng mới sau sync hiện Missing content → admin bổ sung rồi publish

### 7.4. Việc admin không làm

- Không tạo `roomTypeID` thủ công.
- Không sửa `rack_rate` / `max_occupancy` như nguồn sự thật (readonly từ PMS; chỉ xem).
- Không xóa cứng hạng chỉ vì tắt trên web — dùng unpublish; `is_active` do sync.

---

## 8. API backend NUSS

Prefix thống nhất với convention dự án (ví dụ `/api`). Tất cả admin yêu cầu đăng nhập.

### 8.1. Public

| Method | Path | Việc |
|---|---|---|
| GET | `/api/rooms?locale=vi` | List active + published |
| GET | `/api/rooms/{slug}?locale=vi` | Chi tiết |
| POST | `/api/rooms/availability` | Body: arrival, departure, roomTypeIds? → OnePMS |
| POST | `/api/bookings` | Tạo booking OnePMS (giai đoạn sau catalog) |

Public list/detail **không** gọi OnePMS.

### 8.2. Admin

| Method | Path | Việc |
|---|---|---|
| GET | `/api/admin/room-types` | List sync + trạng thái CMS |
| GET | `/api/admin/room-types/{id}` | Chi tiết + contents + images |
| POST | `/api/admin/room-types/sync` | Manual sync |
| GET | `/api/admin/room-sync-runs` | Lịch sử |
| PUT | `/api/admin/room-types/{id}/contents/{locale}` | Upsert content |
| POST | `/api/admin/room-types/{id}/contents/{locale}/publish` | Publish |
| POST | `/api/admin/room-types/{id}/contents/{locale}/unpublish` | Unpublish |
| POST | `/api/admin/room-types/{id}/images?asCover=true\|false` | Upload (cover hoặc gallery) |
| PUT | `/api/admin/room-types/{id}/images/reorder` | Đổi thứ tự gallery |
| PUT | `/api/admin/room-types/{id}/images/{imageId}/cover` | Đặt cover từ gallery |
| DELETE | `/api/admin/room-types/{id}/images/{imageId}` | Xóa ảnh |

### 8.3. Ví dụ public list item

```json
{
  "slug": "phong-deluxe-huong-bien",
  "externalId": "double",
  "pmsName": "Double",
  "maxOccupancy": 2,
  "rackRate": 400000,
  "currency": "VND",
  "content": {
    "locale": "vi",
    "title": "Phòng Deluxe hướng biển",
    "shortDescription": "Nhìn ra biển, phù hợp cặp đôi.",
    "amenities": ["Giường King", "Ban công"]
  },
  "coverImage": {
    "url": "https://.../cover.webp",
    "altText": "Phòng Deluxe"
  }
}
```

`rackRate` trên list là giá sync từ OnePMS `price`, ghi chú UI là giá tham khảo nếu cần.

---

## 9. Availability và booking (gắn với catalog)

Catalog xong rồi mới bắt buộc hoàn thiện hai API này trên production. Thiết kế sẵn để không phá CMS.

1. Availability body dùng `external_id` (`roomTypeID`) đã lưu trong `room_types`.
2. Trước `addBooking`: gọi lại `checkAvailabilityAndRate`; `amount < số phòng xin` thì dừng.
3. `rates` gửi lên `addBooking` phải khớp `dailyRates` vừa nhận (tránh lỗi `007`).
4. Web chỉ success khi OnePMS `result = "00"` và có `bookingReference`.
5. Hai khách bấm cùng lúc: lần check-before-book giảm phần lớn trùng; chặn tuyệt đối phụ thuộc OnePMS từ chối khi hết phòng.

---

## 10. Plan triển khai (để chia task)

### Phase A — Nền OnePMS + DB

**BE**

- Env credentials + `OnePmsAuthService` + `OnePmsClient.getRoomTypes`
- Migration 4 bảng
- `RoomSyncService` + scheduled + manual endpoint
- Test: upsert, không mất CMS khi đổi tên PMS, lỗi PMS không phá catalog

**Xong khi:** gọi sync từ Postman/admin API thấy hạng Mai Phương nằm trong DB.

### Phase B — Admin CMS

**BE:** content upsert, publish rules, upload ảnh  
**FE admin:** `/admin/rooms` list, edit vi/en, upload cover + gallery, nút sync, lịch sử sync

**Xong khi:** admin publish được một hạng có ảnh; hạng draft không ra public API.

### Phase C — Client trang Phòng

**BE:** public list/detail  
**FE:** `/[locale]/rooms`, `/[locale]/rooms/[slug]`, empty/error, i18n labels

**Xong khi:** khách xem list và chi tiết chỉ từ API NUSS, không gọi OnePMS trên browser.

### Phase D — Availability + đặt phòng OnePMS

**BE:** availability + addBooking + check lại trước đặt  
**FE:** form booking gắn hạng từ slug  
**Admin:** xem mã `bookingReference` (và/hoặc giữ BookingRequest nội bộ làm audit)

**Xong khi:** đơn thử trên web xuất hiện trên OnePMS; hết phòng thì web không success.

### Phase E — Cứng hóa

- Log sync, monitor auth OnePMS
- Backup DB + file ảnh
- ShedLock nếu scale backend
- Không log password/secretKey

---

## 11. Tiêu chí nghiệm thu trang Phòng

1. Sync lấy đúng hạng từ OnePMS theo `hotelID` đã chốt.
2. Đổi tên hạng trên OnePMS rồi sync: CMS ảnh/mô tả không mất.
3. Tắt hạng khỏi snapshot sync thành công: `is_active=false`, biến mất khỏi `/rooms`.
4. Draft không public; publish đủ điều kiện mới hiện.
5. `/rooms` không gọi OnePMS trong request hiển thị.
6. Availability/booking (khi bật) dùng `roomTypeID` local đã map, không hard-code.
7. Locale `vi` / `en` độc lập nội dung.

---

## 12. Liên hệ tài liệu khác

| Tài liệu | Quan hệ |
|---|---|
| [kien-truc-web.md](kien-truc-web.md) | Menu, stack, phạm vi site; tài liệu này chi tiết hóa mục Phòng |
| [tien-do-du-an.md](tien-do-du-an.md) | Phase tổng; Phase A–D trên map vào phase backend/FE/admin/PMS |
| [TÍCH HỢP ONEPMS API 3.4.md](TÍCH%20HỢP%20ONEPMS%20API%203.4.md) | Hợp đồng API thật |
| [resort-room-catalog-cms-technical-design.md](resort-room-catalog-cms-technical-design.md) | Bản thiết kế tổng quát; bản này đã gắn OnePMS và NUSS |

Khi implement, ưu tiên tài liệu này cho module Phòng. Field OnePMS đổi so với mẫu thì cập nhật mục 2.1 và migration, giữ nguyên flow sync + CMS.
