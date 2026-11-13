# Triển khai trang Nhà hàng + Page Builder (CMS khối)

Tài liệu đặc tả và kế hoạch triển khai cho mục menu **Nhà hàng** (route công khai `/restaurants`, quản trị `/admin/restaurants`) tại Mai Phương Resort.

**Điểm khác các module trước (Rooms / Experiences):** nội dung trang **không** gắn layout cố định trong code. Nhân viên biên tập bằng **page builder** (kéo-thả khối). Nếu làm ổn trên Nhà hàng, cùng engine sẽ tái dùng cho Spa, Ưu đãi, About, v.v.

Tham chiếu:

- [kien-truc-web.md](kien-truc-web.md)
- [tien-do-du-an.md](tien-do-du-an.md)
- [trien-khai-diem-den-tour-ve.md](trien-khai-diem-den-tour-ve.md) — pattern CMS locale / publish / upload ảnh
- Pattern đã có: JWT admin, `ImageStorageService`, Flyway, public list/detail

Tham khảo kiến trúc bên ngoài (ý tưởng, không phụ thuộc vendor):

- Block registry + JSON tree + renderer/editor tách nhau (ChaiBuilder, NextSpark, Nextly page builder)
- Nội dung lưu JSONB; validate schema phía server trước khi publish

---

## 1. Mục tiêu

### 1.1. Nghiệp vụ Nhà hàng

Trang Nhà hàng **chỉ để giới thiệu** không gian / trải nghiệm ẩm thực trong khuôn viên (ảnh, mô tả, giờ mở cửa, thực đơn mang tính tham khảo…). **Không** thuộc phạm vi đặt bàn, order món hay thanh toán.

- Khách xem danh sách nhà hàng / điểm ăn uống và trang chi tiết từng điểm.
- Nhân viên resort **tự dựng bố cục trang chi tiết** bằng các khối (element), không cần sửa code / chờ layout mới.
- Hỗ trợ **Save Draft**, **Preview**, **Publish** theo locale (`vi` / `en`).

### 1.2. Mục tiêu kỹ thuật (engine tái sử dụng)

Xây **một Page Builder core** dùng cho Nhà hàng trước, thiết kế để sau này gắn vào entity khác chỉ bằng:

- `page_type` / `owner` khác (vd. `restaurant` → `spa` → `offer`)
- cùng block registry, cùng admin editor shell, cùng public renderer

### 1.3. Không làm trong bước này

- AI sinh layout, A/B test, versioning phức tạp (có thể phase sau: revision history).
- Element tùy ý từ admin (HTML tự do / script) — **cấm** để tránh XSS và lệch brand.
- Theme builder toàn site; chỉ style trong phạm vi từng element (màu, khoảng cách, căn lề…).

---

## 2. Hiện trạng

| Lớp | Hiện trạng |
|---|---|
| Public | Homepage có section `#restaurants` hardcode 2 card Unsplash + i18n. Menu/footer trỏ `/restaurants` → **chưa có** `app/[locale]/restaurants`. |
| Admin | Chưa có `/admin/restaurants`. |
| Backend | Chưa có package `restaurants` / bảng liên quan. |

---

## 3. Nguyên tắc thiết kế Page Builder

### 3.1. Ba lớp tách bạch

```text
┌─────────────────────────────────────────────────────────┐
│ 1. Block Registry (code)                                │
│    type → schema props, default, Editor UI, Renderer    │
├─────────────────────────────────────────────────────────┤
│ 2. Document JSON (DB)                                   │
│    cây khối đã validate: id, type, props, children[]    │
├─────────────────────────────────────────────────────────┤
│ 3. Surfaces                                             │
│    Admin Editor (client) | Preview | Public SSR render  │
└─────────────────────────────────────────────────────────┘
```

| Lớp | Ai sở hữu | Ghi chú |
|---|---|---|
| Registry | Developer | Thêm element mới = thêm mã + đăng ký, **không** để admin tự tạo type |
| Document | Nhân viên (qua API) | Chỉ lưu data; không lưu React component |
| Renderer | Shared | Cùng component render Preview và trang công khai (tránh lệch WYSIWYG) |

### 3.2. Admin = 3 vùng (bắt buộc theo yêu cầu)

```text
┌──────────────┬────────────────────────────┬─────────────────┐
│   Sidebar    │         Canvas             │ Settings Panel  │
│  Elements    │   (kéo-thả / chọn khối)    │  thuộc tính     │
│  + Structure │                            │  element đang   │
│    tree      │                            │  chọn           │
└──────────────┴────────────────────────────┴─────────────────┘
     Toolbar: Undo/Redo | Device preview | Save Draft | Preview | Publish
```

| Vùng | Chức năng |
|---|---|
| **Sidebar** | Palette element (kéo vào canvas) + tree cấu trúc trang (click để chọn, kéo để reorder) |
| **Canvas** | Vùng dựng layout; hiển thị gần giống trang public; chọn / hover / drop zone |
| **Settings** | Form thuộc tính của element đang chọn (nội dung, ảnh, size, align, màu, spacing…) |

### 3.3. Thao tác element (MVP)

- Thêm (kéo từ palette hoặc nút “+”)
- Chọn
- Sắp xếp (kéo trên canvas hoặc trên tree)
- Xóa
- Nhân bản (duplicate)
- Chỉnh sửa props qua Settings
- Nest vào **Columns** (tối đa độ sâu giới hạn, đề xuất **≤ 3**)

### 3.4. Draft / Preview / Publish

| Trạng thái | Ý nghĩa |
|---|---|
| `draft` | Bản đang sửa; public **không** thấy (trừ preview token) |
| `published` | Bản đang live trên `/restaurants/[slug]` |

Đề xuất lưu **hai bản document** (hoặc `document_draft` + `document_published`) theo locale để sửa draft không phá bản đang publish.

- **Save Draft:** ghi `document_draft` + metadata SEO/slug.
- **Preview:** mở `/restaurants/[slug]/preview?token=…` hoặc query `?preview=1` + cookie admin; render từ draft.
- **Publish:** copy draft → published (sau validate bắt buộc), set `published_at`, `cms_status = Published`.

---

## 4. Mô hình dữ liệu

### 4.1. `restaurants` (bản ghi gốc)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID PK | |
| `display_order` | INT NOT NULL DEFAULT 0 | Thứ tự list |
| `is_active` | BOOLEAN NOT NULL DEFAULT TRUE | Soft-hide toàn bài |
| `cover_image_url` | VARCHAR / TEXT NULL | Ảnh list card (có thể lấy từ media upload) |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### 4.2. `restaurant_contents` (theo locale)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID PK | |
| `restaurant_id` | UUID FK | |
| `locale` | VARCHAR(5) | `vi` \| `en` |
| `slug` | VARCHAR(200) | Unique theo locale khi published |
| `title` | VARCHAR(300) | Tiêu đề list + SEO fallback |
| `short_description` | TEXT | Card list / homepage |
| `seo_title` / `seo_description` | TEXT | |
| `document_draft` | JSONB NOT NULL | Cây khối bản nháp |
| `document_published` | JSONB NULL | Cây khối đã publish |
| `cms_status` | VARCHAR(20) | `Draft` \| `Published` \| `Missing` |
| `is_published` | BOOLEAN | |
| `published_at` | TIMESTAMPTZ NULL | |
| UNIQUE(`restaurant_id`, `locale`) | | |

### 4.3. Schema document JSON (chuẩn chung cho mọi page type sau này)

```json
{
  "version": 1,
  "root": {
    "id": "root",
    "type": "root",
    "props": {},
    "children": [
      {
        "id": "blk_01HXYZ...",
        "type": "heading",
        "props": {
          "text": "Nhà hàng chính",
          "level": 2,
          "align": "left",
          "color": "#243b3e",
          "margin": { "top": 0, "bottom": 16 }
        },
        "children": []
      },
      {
        "id": "blk_01HABC...",
        "type": "columns",
        "props": {
          "columns": 2,
          "gap": 24,
          "stackOnMobile": true
        },
        "children": [
          {
            "id": "blk_col_a",
            "type": "column",
            "props": {},
            "children": [ /* blocks */ ]
          },
          {
            "id": "blk_col_b",
            "type": "column",
            "props": {},
            "children": [ /* blocks */ ]
          }
        ]
      }
    ]
  }
}
```

Quy ước:

- Mỗi node: `id` (ULID/UUID), `type` (enum registry), `props` (object), `children` (array).
- Chỉ `columns` / `column` / (tuỳ chọn `section`) được phép có children; các khối nội dung leaf thường `children: []`.
- `version` tăng khi đổi schema breaking; migration document nếu cần.

### 4.4. Media

Tái dùng `ImageStorageService` (folder `restaurants/`):

- Upload ảnh cho Image / Gallery / Slider / cover list.
- Video: MVP chấp nhận **URL embed** (YouTube/Vimeo) hoặc file mp4 upload nếu storage cho phép; chốt 1 hướng trong phase triển khai (đề xuất: **URL embed trước**, file sau).

Không hardcode Unsplash trên trang public sau khi CMS live.

---

## 5. Catalog element (MVP)

Mỗi element trong registry phải khai báo:

| Trường registry | Ý nghĩa |
|---|---|
| `type` | Mã cố định |
| `label` / `icon` | Sidebar |
| `category` | `content` \| `media` \| `layout` \| `action` |
| `defaultProps` | Khi thả vào canvas |
| `propsSchema` | Validate (Zod phía client + mirror validate Java/JSON Schema phía BE) |
| `Editor` | (tuỳ) overlay canvas |
| `SettingsFields` | Form Settings Panel |
| `Renderer` | Public + Preview |
| `canHaveChildren` | boolean |
| `allowedParentTypes` | vd. `column` chỉ nằm trong `columns` |

### 5.1. Danh sách bắt buộc (theo yêu cầu)

| Type | Category | Props chính (MVP) |
|---|---|---|
| `heading` | content | `text`, `level` (1–3), `align`, `color`, `margin` |
| `text` | content | `html` hoặc `text` + basic rich (bold/italic/link) **whitelist**, `align`, `color`, `fontSize`, `margin` |
| `image` | media | `src`, `alt`, `width` (`full`\|`%`\|px), `align`, `radius`, `margin` |
| `imageGallery` | media | `images[]` `{src,alt}`, `columns` (2–4), `gap`, `margin` |
| `slider` | media | `slides[]` `{src,alt,caption?}`, `autoplay` (bool), `intervalMs` (mặc định 3000), `showDots`, `margin` |
| `video` | media | `provider` (`youtube`\|`vimeo`\|`file`), `url`, `poster?`, `aspect`, `margin` |
| `button` | action | `label`, `href`, `style` (`primary`\|`secondary`\|`link`), `align`, `openInNewTab`, `margin` |
| `divider` | layout | `style` (`solid`\|`dashed`), `color`, `thickness`, `margin` |
| `spacer` | layout | `height` (px) |
| `columns` | layout | `columns` (2\|3), `gap`, `stackOnMobile`; children = đúng N node `column` |

Nội bộ thêm (không hiện palette hoặc hiện nhẹ):

| Type | Vai trò |
|---|---|
| `root` | Gốc document |
| `column` | Ô trong `columns` |

### 5.2. Style tokens dùng chung trong props

Để UI Settings gọn và brand không loạn:

```text
align: left | center | right
color: chọn từ palette resort (+ custom hex optional phase 2)
margin: { top, right, bottom, left } số px (hoặc scale 0/8/16/24/32/48)
```

Canvas và Renderer map props → CSS class / CSS variables của design system hiện có (`--ocean`, `--cream`, serif heading…).

### 5.3. Rich text an toàn

- **Không** cho `dangerouslySetInnerHTML` từ HTML thô chưa sanitize.
- Phase 1: `text` dạng plain + xuống dòng; hoặc rich tối thiểu lưu JSON marks (bold/italic/link).
- Nếu lưu HTML: sanitize server-side (allowlist tag).

---

## 6. Admin UI chi tiết

### 6.1. Routes

| Route | Việc |
|---|---|
| `/admin/restaurants` | List: title, locale status, active, thứ tự, tạo mới |
| `/admin/restaurants/[id]` | Meta (slug, SEO, cover, active) + **mở Page Builder** theo locale |
| `/admin/restaurants/[id]/builder?locale=vi` | Full editor 3 cột (có thể fullscreen) |

### 6.2. Hành vi editor

- **Undo / Redo** stack thao tác trên document (client); Save Draft mới persist.
- **Autosave draft** (tuỳ chọn phase 2): debounce 5–10s.
- **Device switcher** trên canvas: Desktop / Tablet / Mobile (chỉ đổi width khung preview, không đổi data trừ props responsive phase sau).
- **Empty state:** canvas trống → CTA “Thêm Heading” / kéo từ Sidebar.
- **Confirm** khi xóa element có children.
- Responsive admin: trên mobile hẹp, 3 cột xếp lại (palette drawer / settings drawer); ưu tiên desktop cho biên tập.

### 6.3. Drag & drop

Đề xuất thư viện: `@dnd-kit/core` (nhẹ, controlled) hoặc tương đương đã quen trong team.

Luật drop:

- Leaf block chỉ drop vào `root` hoặc `column`.
- `columns` không nest `columns` trong MVP (tránh layout rối) **hoặc** cho 1 cấp — chốt: **không nest columns**.
- Khi thả `columns`, tự tạo đủ N `column` rỗng.

### 6.4. Settings Panel theo type

Mỗi type map sang form fields tái sử dụng:

- TextField, TextareaField, SelectField, NumberField, ColorField, SpacingField, ImagePickerField, RepeaterField (gallery/slides), SwitchField, UrlField

ImagePicker gọi API upload restaurants → trả URL `/uploads/...`.

---

## 7. Public client

### 7.1. Routes

| Route | Nội dung |
|---|---|
| `/[locale]/restaurants` | List active + published: cover, title, shortDescription, CTA |
| `/[locale]/restaurants/[slug]` | Render `document_published` qua block renderer |
| Preview (admin) | Cùng renderer, nguồn `document_draft` |

### 7.2. Renderer

```text
<PageRenderer document={doc} />
  → walk tree
  → BlockRegistry[type].Renderer(props, children)
```

- Server Component ưu tiên (SSR/SEO).
- Chỉ `slider` / `video` cần Client island nhỏ.
- Thiếu type trong registry → bỏ qua + log (không crash trang).

### 7.3. Homepage

Section `#restaurants` lấy 2–4 item published từ API (giống experiences), **bỏ hardcode Unsplash** khi API sẵn sàng.

---

## 8. API (đề xuất)

Base: `/api/...` public, `/api/admin/...` JWT.

### 8.1. Public

| Method | Path | Việc |
|---|---|---|
| GET | `/api/restaurants?locale=` | List published + active |
| GET | `/api/restaurants/{slug}?locale=` | Detail + `document` = published |

### 8.2. Admin

| Method | Path | Việc |
|---|---|---|
| GET | `/api/admin/restaurants` | List kèm status locale |
| POST | `/api/admin/restaurants` | Tạo mới + content locale đầu (document_draft mặc định `{version:1,root:{...}}`) |
| GET | `/api/admin/restaurants/{id}` | Full admin |
| PUT | `/api/admin/restaurants/{id}` | Meta: order, active, cover |
| PUT | `/api/admin/restaurants/{id}/contents/{locale}` | Upsert title, slug, SEO, **document_draft** |
| POST | `/api/admin/restaurants/{id}/contents/{locale}/publish` | Validate + publish |
| POST | `/api/admin/restaurants/{id}/contents/{locale}/unpublish` | Gỡ published |
| POST | `/api/admin/restaurants/{id}/preview-token` | Token ngắn hạn xem draft |
| POST multipart | `/api/admin/restaurants/{id}/media` | Upload ảnh |
| DELETE | `/api/admin/restaurants/{id}` | Soft `is_active=false` (hoặc deactivate) |

### 8.3. Validate khi Publish (bắt buộc)

- `title`, `slug` không rỗng; slug unique theo locale.
- `document_draft` parse được, `version` hỗ trợ.
- Mọi `type` ∈ registry; props pass schema.
- Không vượt `maxDepth`; không nest columns (theo luật MVP).
- Image/slider: `src` bắt buộc nếu block tồn tại.
- Button: `href` bắt buộc.

Lỗi trả `400` + danh sách `{ path, code, message }` để editor highlight block.

---

## 9. Cấu trúc thư mục đề xuất (client)

```text
nuss-client/src/
  components/page-builder/
    PageBuilderShell.tsx          # 3 cột + toolbar
    Palette.tsx
    StructureTree.tsx
    Canvas.tsx
    SettingsPanel.tsx
    dnd/
    fields/                       # form fields dùng chung
    registry/
      index.ts                    # BLOCK_REGISTRY
      types.ts
      blocks/
        heading.ts / heading-settings.tsx / heading-render.tsx
        text.ts
        image.ts
        image-gallery.ts
        slider.ts
        video.ts
        button.ts
        divider.ts
        spacer.ts
        columns.ts
    render/
      PageRenderer.tsx            # public + preview + canvas (mode)
  app/admin/restaurants/
    page.tsx
    [id]/page.tsx
    [id]/builder/page.tsx
  app/[locale]/restaurants/
    page.tsx
    [slug]/page.tsx
  services/admin-restaurants.ts
  services/restaurants.ts
  styles/page-builder.css
  styles/restaurants.css
```

Backend:

```text
nuss-backend/src/main/java/com/maiphuong/nuss/
  restaurants/          # entity, repo, service, controller (public + admin)
  pagebuilder/          # (optional package) DocumentValidator dùng chung
```

Flyway: `V7__restaurants_page_builder.sql` (số version điều chỉnh theo migration hiện có).

---

## 10. Kế hoạch triển khai theo phase

### Phase A — Nền tảng document + registry (không UI kéo-thả hoàn chỉnh)

1. Migration bảng `restaurants` / `restaurant_contents`.
2. API CRUD meta + lưu/đọc `document_draft` JSON thô.
3. Registry + `PageRenderer` với 4 khối đơn giản: `heading`, `text`, `image`, `spacer`.
4. Public list + detail render document mẫu seed.
5. Admin: form meta + **JSON textarea tạm** hoặc form đơn giản để chứng minh pipeline Draft/Publish.

**Done khi:** publish 1 bài seed hiện đúng trên `/restaurants/[slug]`.

### Phase B — Editor 3 vùng + DnD

1. `PageBuilderShell` + Palette + Canvas + Settings.
2. DnD thêm / reorder / xóa / duplicate.
3. Settings cho đủ element MVP còn lại: gallery, slider, video, button, divider, columns.
4. Upload media gắn ImagePicker.
5. Save Draft + Publish + validate lỗi trả về UI.

**Done khi:** nhân viên dựng được 1 trang nhà hàng đủ heading/ảnh/gallery/CTA không đụng code.

### Phase C — Preview & UX

1. Preview draft (token hoặc session admin).
2. Undo/Redo, device width switch.
3. Empty states, confirm xóa, toast lỗi validate theo block.
4. Responsive admin drawers.
5. Thay homepage restaurants hardcode → API.

**Done khi:** checklist mục 12 pass trên desktop + mobile public.

### Phase D — Tái sử dụng engine (sau Nhà hàng)

1. Đổi tên tư duy: `PageDocument` gắn `owner_type` + `owner_id` (restaurant | spa | offer | custom).
2. Spa / Offer dùng cùng builder route pattern.
3. (Tuỳ chọn) Migration Experiences từ layout cố định → document — **chỉ khi** nghiệp vụ chốt bỏ 3 layout.

---

## 11. Bảo mật & vận hành

- Mọi API admin JWT như Rooms/Experiences.
- Sanitize / schema validate trước publish.
- Giới hạn kích thước JSON document (vd. 500 KB) và số block (vd. ≤ 150).
- Upload: chỉ jpeg/png/webp; giới hạn dung lượng; không SVG scriptable nếu chưa harden.
- Preview token: TTL ngắn (15–30 phút), one-time hoặc gắn user.
- Không cho phép props chứa `onclick` / raw `<script>`.

---

## 12. Acceptance criteria (Nhà hàng MVP)

- [ ] `/restaurants` list từ API; ẩn / unpublished không lộ.
- [ ] `/restaurants/[slug]` render đúng document đã publish.
- [ ] Admin tạo nhà hàng, sửa 2 locale, Save Draft, Publish / Unpublish.
- [ ] Editor có Sidebar + Canvas + Settings.
- [ ] Kéo-thả thêm, sắp xếp, xóa, nhân bản element.
- [ ] Đủ 10 loại element: Heading, Text, Image, Image Gallery, Slider, Video, Button, Divider, Spacer, Columns.
- [ ] Cấu hình được nội dung, ảnh, kích thước/căn lề, màu, khoảng cách (trong phạm vi props MVP).
- [ ] Preview trước khi publish.
- [ ] Public + admin dùng được trên desktop; public ổn trên mobile.
- [ ] Không còn phụ thuộc ảnh Unsplash hardcode cho mục Nhà hàng sau khi có nội dung CMS.

---

## 13. Rủi ro & quyết định cần chốt sớm

| Rủi ro | Hướng xử lý |
|---|---|
| Scope builder phình to | Bám phase A→B→C; cấm custom HTML |
| Lệch Preview vs Public | **Một** `PageRenderer`, mode `edit` \| `preview` \| `live` |
| JSON hỏng / type cũ | `version` + ignore unknown type an toàn; validate publish |
| Columns phức tạp | MVP 2–3 cột, không nest |
| Video hosting | Ưu tiên embed URL trước |
| Đội resort khó dùng | Seed template “Nhà hàng chuẩn” (1 click áp document mẫu) |

**Quyết định đề xuất sẵn (có thể sửa trước khi code):**

1. Document lưu **JSONB draft + published** per locale.
2. Rich text MVP = plain/marks tối thiểu, không HTML tự do.
3. `@dnd-kit` cho DnD.
4. Slider autoplay mặc định 3s (đồng bộ UX experiences).
5. Engine đặt tên generic `page-builder` ngay từ đầu dù pilot là restaurants.

---

## 14. Seed & template

Seed tối thiểu:

- 1–2 nhà hàng (`vi` + `en`).
- Document mẫu: Heading → Text → Image → Image Gallery → Button.
- Cover cho list.

Nút admin **“Áp dụng mẫu Nhà hàng”** ghi đè draft (có confirm) giúp onboarding.

---

## 15. Liên hệ tiến độ dự án

Gắn vào [tien-do-du-an.md](tien-do-du-an.md):

- Phase tài liệu: file này = đặc tả Nhà hàng + Page Builder.
- Backend API restaurants + validator document ⊂ phase 3.
- Public `/restaurants` ⊂ phase 4.
- Admin builder ⊂ phase 5 (công lớn hơn Experiences vì có editor).

Ưu tiên: **xong Experiences ổn định** → làm Phase A Nhà hàng → Phase B editor trước khi lan sang Spa/Offer.

---

## 16. Tóm tắt một câu

**Nhà hàng là trang giới thiệu (không đặt bàn / order / thanh toán) và là pilot cho Page Builder dạng block JSON:** admin biên tập bằng Sidebar + Canvas + Settings (kéo-thả, đủ element MVP, draft/preview/publish); public chỉ render document đã publish qua registry cố định — để sau này bỏ layout cứng trên các trang bài viết khác mà không viết lại CMS từ đầu.
