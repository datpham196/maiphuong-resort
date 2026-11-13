# Kiến trúc tổng quát website Mai Phương Resort

Tài liệu này mô tả khung website resort mới cho bước xây dựng đầu tiên. Tích hợp PMS sẽ chốt sau, khi có tài liệu API.

## 1. Mục tiêu

Website là kênh nhận diện khi khách tìm resort, đồng thời giới thiệu đúng các mục menu khách đã chốt: trang chủ, giới thiệu tổng quan, điểm đến / tour / vé khu vui chơi, phòng, nhà hàng, spa, ưu đãi và kho ảnh khách đến MP.

Khách vẫn đặt phòng trên website. Ở bước này mới dựng luồng và trang đặt phòng. Nguồn phòng trống và việc ghi đơn vào PMS gắn vào sau, tại backend, khi API đã rõ.

## 2. Phạm vi bước này

Làm trong bước đầu:

- Site công khai, tách frontend và backend.
- Trang và dữ liệu cho menu đã chốt: giới thiệu, điểm đến / tour / vé khu vui chơi, phòng, nhà hàng, spa, ưu đãi, kho ảnh.
- Trang đặt phòng chạy trên dữ liệu nội bộ.
- Khu quản trị để resort tự sửa nội dung, không cần sửa code.
- Chỗ cắm tích hợp PMS trên backend, chưa gọi API thật.

Chưa làm trong bước này:

- Đọc phòng trống từ PMS và tạo booking trên PMS.
- Thanh toán online.
- Tài khoản khách lưu trú.
- Đồng bộ giá, tồn phòng, hủy phòng hai chiều.

## 3. Kiến trúc hệ thống

Hai ứng dụng nằm sẵn trong repo:

| Thành phần | Công nghệ | Thư mục | Vai trò |
|---|---|---|---|
| Frontend | React, Next.js | `nuss-client` | Giao diện công khai và khu quản trị |
| Backend | Java 21, Spring Boot 3 | `nuss-backend` | API, nghiệp vụ, dữ liệu, xác thực quản trị |
| Cơ sở dữ liệu | PostgreSQL | do backend quản lý | Nội dung website và đơn đặt phòng tạm |
| Cổng production | Nginx | trên máy chủ | Tên miền, HTTPS, chuyển API vào backend |
| PMS | hệ thống sẵn có của resort | nối sau qua backend | Sổ phòng của khách sạn |

Frontend chỉ gọi backend của Mai Phương Resort. Backend là nơi sẽ gọi PMS. Nhờ vậy, khi có API, phần đổi nằm ở backend; các trang đặt phòng giữ nguyên luồng người dùng.

```text
Khách / nhân viên resort
        |
        v
   nuss-client
   (trang công khai + quản trị)
        |
        v
   nuss-backend
   (nội dung, đơn đặt phòng, tài khoản quản trị)
        |
        +-- PostgreSQL
        |
        +-- [để sau] API PMS
```

### Công nghệ

| Lớp | Công nghệ | Cách dùng trong dự án |
|---|---|---|
| Frontend | React với Next.js | Trang công khai trả HTML sẵn để nội dung hiện khi khách tìm kiếm. Khu quản trị nằm cùng ứng dụng, gọi API backend. |
| Backend | Java 21, Spring Boot 3 | Spring Web cho API, Spring Data JPA cho PostgreSQL, Spring Security cho phiên quản trị. Đóng gói một file JAR. |
| Cơ sở dữ liệu | PostgreSQL | Các thực thể ở mục 7. Migration chạy từ backend. |
| Production | Nginx trên một VPS | Máy khoảng 2 GB RAM trở lên, chạy Next.js, file JAR và PostgreSQL. Nginx gắn tên miền và HTTPS, chuyển lời gọi API sang Spring Boot. |

Địa chỉ API và chuỗi kết nối database đặt trong biến môi trường, khác nhau giữa máy local và server. Secret không đưa vào git.

Docker Compose gom Next.js, Spring Boot và PostgreSQL thành một cụm khi cần dựng lại máy chủ. Chạy ba tiến trình trực tiếp trên VPS cũng đủ cho lượng truy cập của resort.

Khi có API PMS, phần thêm nằm trong module `pms` của file JAR và vài biến môi trường (địa chỉ API, thông tin xác thực). Frontend, Nginx và cách đưa bản mới lên giữ nguyên.

Ba lớp trên backend, để phần PMS thêm vào không đụng trang đã làm:

1. **Nội dung** — các mục menu, ảnh, bài giới thiệu. Ảnh điểm đến, tour và vé khu vui chơi do nhân viên đổi trong khu quản trị.
2. **Đặt phòng** — nhận yêu cầu từ website, lưu ở Mai Phương Resort.
3. **Kênh PMS** — interface đọc tồn phòng và tạo booking. Bước này chỉ để chỗ trống, chưa có implementation.

## 4. Cấu trúc source

### nuss-client

Next.js dùng App Router. Mỗi đường dẫn ở mục 5 và mục 6 là một thư mục trong `src/app`.

```text
nuss-client/
├── public/                 # ảnh tĩnh, favicon
└── src/
    ├── app/                # từng trang theo mục 5 và 6
    ├── components/         # khối dùng lại: header, footer, thẻ phòng, form
    ├── features/           # phòng, nhà hàng, spa, ưu đãi, điểm đến, kho ảnh, đặt phòng, liên hệ
    ├── services/           # hàm gọi API backend
    └── styles/
```

### nuss-backend

Dự án Maven. Package Java nằm dưới `src/main/java`. Tên các module nghiệp vụ giữ nguyên.

```text
nuss-backend/
├── src/main/java/.../
│   ├── modules/
│   │   ├── rooms/
│   │   ├── restaurants/
│   │   ├── experiences/    # điểm đến, tour, vé khu vui chơi
│   │   ├── spa/
│   │   ├── offers/         # ưu đãi
│   │   ├── gallery/        # kho ảnh khách đến MP
│   │   ├── bookings/       # đơn trên website, chưa gọi PMS
│   │   ├── contacts/
│   │   ├── content/        # trang chủ, giới thiệu, banner
│   │   ├── auth/           # đăng nhập quản trị
│   │   └── pms/            # chỗ cắm API PMS, chưa nối
│   └── shared/
├── src/main/resources/     # application.yml, cấu hình theo môi trường
└── database/               # migration PostgreSQL
```

Mỗi module nghiệp vụ gồm API công khai (đọc, gửi form) và API quản trị (thêm, sửa, ẩn nội dung).

## 5. Trang công khai

Menu header, đúng thứ tự khách đã chốt:

| Thứ tự | Mục menu | Đường dẫn | Nội dung chính |
|---|---|---|---|
| 1 | Trang chủ | `/` | Ảnh lớn, giới thiệu ngắn, lối vào các mục menu, thông tin liên hệ |
| 2 | Giới thiệu tổng quan | `/about` | Câu chuyện resort, vị trí, tiện ích chung |
| 3 | Điểm đến / các tour / vé khu vui chơi | `/experiences` | Ba nhóm trên cùng một trang. Mỗi mục là ảnh và chú thích. Nhân viên đổi ảnh trong quản trị |
| 4 | Phòng | `/rooms` | Loại phòng, sức chứa, giá tham khảo, ảnh |
| 5 | Nhà hàng | `/restaurants` | Các nhà hàng trong resort |
| 6 | Spa | `/spa` | Giới thiệu spa, ảnh, dịch vụ |
| 7 | Ưu đãi | `/offers` | Chương trình ưu đãi đang đăng |
| 8 | Kho lưu trữ hình ảnh khách đến MP | `/gallery` | Bộ ảnh khách đến resort |

Các trang mở từ mục menu, không phải mục header:

| Đường dẫn | Trang | Nội dung chính |
|---|---|---|
| `/experiences/:slug` | Chi tiết một điểm đến, tour hoặc vé | Ảnh, mô tả. Tour có thêm lịch trình, thời lượng, giá. Vé có thêm giá và điều kiện |
| `/rooms/:slug` | Chi tiết phòng | Mô tả, ảnh, tiện nghi, nút sang đặt phòng |
| `/restaurants/:slug` | Chi tiết nhà hàng | Giới thiệu, giờ mở cửa, thực đơn, ảnh |
| `/offers/:slug` | Chi tiết ưu đãi | Nội dung chương trình, ảnh, thời gian áp dụng |
| `/booking` | Đặt phòng | Chọn ngày, số khách, loại phòng, thông tin khách, gửi yêu cầu. Mở từ trang phòng |
| `/booking/success` | Đã ghi nhận | Mã yêu cầu và bước tiếp theo. Chưa phải xác nhận của PMS |
| `/contact` | Liên hệ | Form, địa chỉ, bản đồ, điện thoại. Nằm ở footer |

Mục “Điểm đến / các tour / vé khu vui chơi” là một mục menu. Khách ghi chú mục này cập nhật bằng hình ảnh: resort tự thêm, thay, xóa và sắp ảnh trong `/admin/experiences`. Trang công khai đọc danh sách ảnh đang lưu, không gắn ảnh cố định trong code.

Đặt phòng ở bước này lưu một yêu cầu trong hệ thống Mai Phương Resort để hoàn thiện giao diện và luồng. Nhân viên resort xử lý yêu cầu đó trong khu quản trị. Khi có PMS, cùng form này sẽ chuyển sang tạo booking trên PMS thay vì chỉ lưu nội bộ.

## 6. Khu quản trị

Đường dẫn gốc: `/admin`. Chỉ tài khoản nhân viên resort đăng nhập được.

| Đường dẫn | Việc quản lý |
|---|---|
| `/admin/login` | Đăng nhập |
| `/admin` | Trang tổng quan: yêu cầu đặt phòng mới, liên hệ mới |
| `/admin/rooms` | Loại phòng, ảnh, sức chứa, giá hiển thị, thứ tự |
| `/admin/bookings` | Danh sách yêu cầu đặt từ website |
| `/admin/restaurants` | Nhà hàng và thực đơn |
| `/admin/experiences` | Điểm đến, tour, vé khu vui chơi. Mỗi mục có bộ ảnh: thêm, thay, xóa, sắp thứ tự |
| `/admin/spa` | Chữ và ảnh trang spa |
| `/admin/offers` | Ưu đãi: tiêu đề, ảnh, thời gian, ẩn hoặc hiện |
| `/admin/gallery` | Kho ảnh khách đến MP: thêm, xóa, sắp thứ tự, chú thích |
| `/admin/pages` | Ảnh và chữ trên trang chủ, trang giới thiệu |
| `/admin/contacts` | Hộp thư từ form liên hệ |

## 7. Dữ liệu chính

| Thực thể | Dùng cho | Trường chính |
|---|---|---|
| Room | Trang phòng và form đặt | tên, slug, mô tả, sức chứa, giá hiển thị, tiện nghi, ảnh, đang bán |
| Restaurant | Trang nhà hàng | tên, slug, mô tả, giờ mở cửa, ảnh, món tiêu biểu |
| Experience | Điểm đến, tour, vé khu vui chơi | nhóm (`destination`, `tour`, `ticket`), tên, slug, chú thích, ảnh, thứ tự, đang hiện. Tour thêm lịch trình, thời lượng, giá. Vé thêm giá, điều kiện |
| Offer | Trang ưu đãi | tên, slug, mô tả, ảnh, thời gian áp dụng, đang hiện |
| GalleryImage | Kho ảnh khách đến MP | ảnh, chú thích, thứ tự, đang hiện |
| SpaPage | Trang spa | tiêu đề, mô tả, ảnh, dịch vụ tiêu biểu |
| BookingRequest | Đơn từ website | ngày đến, ngày đi, số khách, phòng, họ tên, liên hệ, trạng thái, mã yêu cầu |
| ContactMessage | Form liên hệ | họ tên, liên hệ, nội dung, đã đọc |
| PageContent | Trang chủ và giới thiệu | khối chữ, ảnh, thứ tự |
| StaffUser | Đăng nhập quản trị | tài khoản, mật khẩu băm, vai trò |

Giá trên website ở bước này là giá giới thiệu do resort nhập. Giá và phòng trống theo ngày sẽ lấy từ PMS ở bước sau, không trộn vào nội dung mô tả phòng.

## 8. API backend

Nhóm đọc công khai:

- `GET /rooms`, `GET /rooms/:slug`
- `GET /restaurants`, `GET /restaurants/:slug`
- `GET /experiences`, `GET /experiences/:slug`
- `GET /spa`
- `GET /offers`, `GET /offers/:slug`
- `GET /gallery`
- `GET /pages/:key` cho nội dung trang chủ và giới thiệu

Nhóm gửi từ website:

- `POST /booking-requests`
- `POST /contacts`

Nhóm quản trị, yêu cầu đăng nhập:

- đăng nhập, đăng xuất
- thêm, sửa, ẩn với từng thực thể ở mục 7
- xem và đổi trạng thái yêu cầu đặt phòng, đánh dấu liên hệ đã đọc

Nhóm để sau, chưa triển khai:

- đọc phòng trống theo ngày
- tạo booking trên PMS
- nhận trạng thái đơn từ PMS

## 9. Luồng khách dùng

1. Vào trang chủ hoặc một mục menu: giới thiệu, điểm đến / tour / vé, phòng, nhà hàng, spa, ưu đãi, kho ảnh.
2. Xem chi tiết một hạng mục.
3. Với phòng, bấm đặt phòng, chọn ngày và điền thông tin.
4. Backend lưu `BookingRequest` và trả mã yêu cầu.
5. Khách thấy trang đã ghi nhận. Resort xem yêu cầu trong khu quản trị.

Form liên hệ đi cùng kiểu: lưu `ContactMessage`, hiện trong khu quản trị.

## 10. Việc chốt khi có tài liệu PMS

Khi có API, chỉ hoàn thiện module `pms` và đổi nguồn của trang đặt phòng:

- danh sách còn trống và giá theo ngày lấy từ PMS
- bấm xác nhận thì backend tạo booking trên PMS
- web báo thành công sau khi PMS nhận đơn

Nội dung các mục menu và khu quản trị giữ như bước này.
