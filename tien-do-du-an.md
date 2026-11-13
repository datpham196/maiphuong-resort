# Tiến độ xây dựng website Mai Phương Resort

Thứ tự làm việc cho website resort mới. Phạm vi từng phase lấy từ [kien-truc-web.md](kien-truc-web.md).

Website công khai và khu quản trị được dựng, kiểm thử, rồi đưa lên tên miền trước. Đọc phòng trống và ghi đơn vào PMS làm ở phase cuối, sau khi có tài liệu API.

## Các phase

| Phase | Việc | Xong khi |
|---|---|---|
| 1 | Tài liệu chi tiết trước khi code | Đọc tài liệu là dựng đúng trang và API, không phải hỏi lại phạm vi |
| 2 | Khung hai ứng dụng chạy ở máy local | Mở được trang chủ trống và trang đăng nhập, database có đủ bảng |
| 3 | Backend: dữ liệu và API | Tạo, sửa, ẩn và đọc được đủ mục menu, đơn đặt phòng và liên hệ |
| 4 | Trang công khai | Đi hết luồng khách xem nội dung, gửi đặt phòng, gửi liên hệ |
| 5 | Khu quản trị | Nhân viên sửa nội dung và xử lý đơn ngay trên web |
| 6 | Kiểm thử với nội dung resort | Các lối đi chính chạy đúng trên desktop và điện thoại |
| 7 | Deploy và bàn giao | Tên miền mở được site, đơn thử xuất hiện trong quản trị trên server |
| 8 | Nối PMS | Làm sau, khi có tài liệu API |

Phase 1 xong rồi mới viết code. Trong phase 3 và 4, module nào có API thì trang tương ứng làm tiếp được. Phase 5 bám API quản trị của từng module. Phase 7 bắt đầu sau khi phase 6 đạt. Phase 8 không chặn việc đưa website nhận diện lên tên miền.

---

## Phase 1. Tài liệu chi tiết

[kien-truc-web.md](kien-truc-web.md) là khung: trang, thực thể, nhóm API, luồng khách. Phase này chốt những gì khung đó còn để ngỏ, để lúc code không tự bịa thêm trường hay thêm màn.

### 1.1. Đặc tả dữ liệu

Viết đủ trường cho các thực thể đã nêu: Room, Restaurant, Experience, Offer, GalleryImage, SpaPage, BookingRequest, ContactMessage, PageContent, StaffUser.

Với mỗi thực thể ghi rõ: tên trường, bắt buộc hay không, kiểu dữ liệu, ví dụ một bản ghi.

Chốt các giá trị trạng thái dùng xuyên suốt:

- Phòng, nhà hàng, điểm đến, tour, vé, ưu đãi, ảnh kho, spa: đang hiện hoặc đang ẩn. Bản ghi ẩn không ra trang công khai. Phòng đang ẩn không chọn được trong form đặt phòng.
- BookingRequest: `new` (mới ghi nhận), `seen` (nhân viên đã mở), `handled` (đã xử lý), `cancelled` (đã hủy). Đơn mới tạo luôn là `new`.
- ContactMessage: chưa đọc hoặc đã đọc.
- StaffUser: một vai trò nhân viên resort. Mật khẩu chỉ lưu dạng đã băm.

Giá trên Room, Experience và Offer ở phase này là giá giới thiệu do resort nhập. Giá theo ngày và phòng trống theo ngày không thêm vào các bảng này.

### 1.2. Hợp đồng API

Với từng endpoint trong mục 8 của tài liệu kiến trúc, ghi method, đường dẫn, thân request, phản hồi thành công, và lỗi dùng lại.

Nhóm đọc công khai:

- `GET /rooms`, `GET /rooms/:slug`
- `GET /restaurants`, `GET /restaurants/:slug`
- `GET /experiences`, `GET /experiences/:slug`
- `GET /spa`
- `GET /offers`, `GET /offers/:slug`
- `GET /gallery`
- `GET /pages/:key` với `key` là `home` và `about`

Nhóm khách gửi:

- `POST /booking-requests` — nhận ngày đến, ngày đi, số khách, phòng, họ tên, liên hệ. Trả mã yêu cầu. Từ chối khi thiếu trường, ngày đi không sau ngày đến, hoặc phòng đang ẩn.
- `POST /contacts` — nhận họ tên, liên hệ, nội dung.

Nhóm quản trị, mọi endpoint đều đòi đăng nhập:

- đăng nhập, đăng xuất
- thêm, sửa, ẩn, sắp thứ tự với phòng, nhà hàng, điểm đến / tour / vé, spa, ưu đãi, kho ảnh, nội dung trang
- danh sách yêu cầu đặt phòng, đổi trạng thái
- danh sách liên hệ, đánh dấu đã đọc

Nhóm PMS ghi trong hợp đồng như endpoint để sau, chưa có request mẫu: đọc phòng trống theo ngày, tạo booking trên PMS, nhận trạng thái đơn từ PMS.

### 1.3. Quy ước nội dung và ảnh

- Slug duy nhất trong từng loại nội dung, sinh từ tên, sửa được trong quản trị.
- Mỗi phòng, nhà hàng, điểm đến, tour, vé, ưu đãi và trang spa có ảnh đại diện và danh sách ảnh. Kho ảnh là danh sách ảnh có chú thích. Ghi định dạng chấp nhận và kích thước tối đa mỗi file.
- Ảnh upload đi qua backend. Trang công khai chỉ nhận URL do backend trả.
- Mục điểm đến / tour / vé khu vui chơi cập nhật bằng hình ảnh: trong `/admin/experiences`, nhân viên thêm, thay, xóa và sắp ảnh của từng mục. Trang `/experiences` hiển thị đúng bộ ảnh đang lưu.
- Trang chủ gồm các khối: ảnh lớn, đoạn giới thiệu ngắn, lối vào các mục menu, và thông tin liên hệ. Thứ tự khối sửa trong quản trị.

### 1.4. Luồng màn hình

Hai luồng vẽ từng bước, kèm trang và API tương ứng:

1. Khách xem phòng, mở chi tiết, sang `/booking`, gửi form, tới `/booking/success` với mã yêu cầu. Đơn nằm trong `/admin/bookings`.
2. Khách gửi form `/contact`. Tin nhắn nằm trong `/admin/contacts` ở trạng thái chưa đọc.

### 1.5. Việc resort cần đưa

Lập danh sách để xin song song với lúc code: chữ và ảnh trang chủ, bài giới thiệu, ảnh từng điểm đến, tour và vé khu vui chơi, từng loại phòng, từng nhà hàng kèm giờ mở cửa và món tiêu biểu, nội dung spa, các ưu đãi, ảnh kho khách đến MP, địa chỉ, điện thoại, tài khoản quản trị đầu tiên, tên miền sẽ trỏ.

Phase 1 xong khi một người chưa tham gia trao đổi với khách vẫn liệt kê được trang, trường dữ liệu và endpoint sẽ làm, khớp với tài liệu kiến trúc.

---

## Phase 2. Khung chạy ở máy local

### 2.1. Công nghệ đã chốt

Dùng bộ đã ghi trong mục Công nghệ của [kien-truc-web.md](kien-truc-web.md):

- `nuss-client`: React với Next.js, trang đặt trong `src/app`.
- `nuss-backend`: Java 21, Spring Boot 3 (Spring Web, Spring Data JPA, Spring Security), đóng gói một file JAR.
- PostgreSQL cho nội dung và yêu cầu đặt phòng.
- Production: Nginx trên một VPS khoảng 2 GB RAM trở lên.

File hướng dẫn chạy local ghi phiên bản Next.js, Java, Spring Boot và PostgreSQL đang cài, kèm lệnh cài và lệnh chạy từng ứng dụng.

### 2.2. Dựng đúng cây thư mục

`nuss-client`: `public/`, `src/app/`, `src/components/`, `src/features/`, `src/services/`, `src/styles/`.

`nuss-backend`: dự án Maven. Package Java dưới `src/main/java/.../modules/` với `rooms`, `restaurants`, `experiences`, `spa`, `offers`, `gallery`, `bookings`, `contacts`, `content`, `auth`, `pms`, cộng `shared/`, `src/main/resources/` và `database/`.

Module `pms` ở phase này là interface trống: hàm đọc tồn phòng và hàm tạo booking, chưa có lời gọi ra ngoài.

### 2.3. Hạ tầng local

- File môi trường mẫu cho hai ứng dụng. Secret thật không đưa vào git.
- Backend kết nối PostgreSQL, có migration cho đủ thực thể ở phase 1.
- Một định dạng lỗi chung cho API, bật CORS cho đúng địa chỉ frontend local.
- Lệnh cài đặt và lệnh chạy từng ứng dụng, viết thành các bước một người khác làm lại được.

### 2.4. Khung giao diện

- Layout công khai: header đúng tám mục menu đã chốt, theo thứ tự trang chủ, giới thiệu tổng quan, điểm đến / tour / vé khu vui chơi, phòng, nhà hàng, spa, ưu đãi, kho ảnh. Footer có thông tin liên hệ.
- Layout quản trị: trang `/admin/login` và khung `/admin` sau đăng nhập.
- Đăng nhập quản trị: mật khẩu băm, tạo phiên, trang quản trị từ chối khi chưa đăng nhập.

Phase 2 xong khi cả hai ứng dụng chạy ở local, database có bảng, mở được trang chủ trống và đăng nhập quản trị thành công.

---

## Phase 3. Backend nghiệp vụ

Làm lần lượt theo thứ tự dưới đây. Module trước phục vụ trang làm trước ở phase 4.

Mỗi module nội dung có API đọc công khai và API quản trị để thêm, sửa, ẩn. Bản ghi ẩn biến mất khỏi API công khai.

### 3.1. Nội dung trang

`content`: đọc và sửa khối chữ, ảnh, thứ tự của `home` và `about`.

### 3.2. Phòng

`rooms`: danh sách, chi tiết theo slug, thêm, sửa, ẩn, sắp thứ tự. Trường theo Room trong tài liệu kiến trúc: tên, slug, mô tả, sức chứa, giá hiển thị, tiện nghi, ảnh, đang bán.

### 3.3. Nhà hàng, điểm đến, spa, ưu đãi, kho ảnh

Cùng kiểu với phòng, theo trường Restaurant, Experience, SpaPage, Offer, GalleryImage.

Nhà hàng có giờ mở cửa và món tiêu biểu. Experience có ba nhóm `destination`, `tour`, `ticket`, mỗi mục có bộ ảnh nhân viên thay được. Tour có lịch trình, thời lượng, giá. Vé có giá và điều kiện sử dụng. Spa là một trang chữ và ảnh. Ưu đãi có thời gian áp dụng. Kho ảnh là danh sách ảnh và chú thích.

### 3.4. Đặt phòng trên website

`POST /booking-requests` lưu BookingRequest, sinh mã yêu cầu, đặt trạng thái `new`.

Kiểm tra ngày và phòng đang bán trước khi lưu. API quản trị liệt kê đơn và đổi trạng thái sang `seen`, `handled`, `cancelled`.

Chưa gọi module `pms`.

### 3.5. Liên hệ

`POST /contacts` lưu ContactMessage ở trạng thái chưa đọc. API quản trị liệt kê và đánh dấu đã đọc.

### 3.6. Bảo vệ API quản trị

Mọi API thêm, sửa, ẩn, xem đơn, xem liên hệ đều từ chối khi không có phiên đăng nhập. API công khai và hai API khách gửi vẫn mở.

### 3.7. Dữ liệu mẫu

Seed tối thiểu để ghép giao diện: vài phòng, một nhà hàng, một điểm đến, một tour, một vé, một ưu đãi, vài ảnh kho, nội dung trang chủ, giới thiệu và spa, một tài khoản nhân viên local.

Phase 3 xong khi từng endpoint trong hợp đồng phase 1 gọi thử được, gồm cả trường hợp từ chối đơn không hợp lệ và từ chối API quản trị khi chưa đăng nhập.

---

## Phase 4. Trang công khai

Mỗi trang gọi API qua `src/services/`. Dữ liệu các mục menu đều lấy từ backend.

Làm theo thứ tự này.

### 4.1. Khung và trang nhận diện

- Header, footer dùng chung.
- `/` đọc `GET /pages/home`, có ảnh lớn, đoạn giới thiệu, lối vào các mục menu, thông tin liên hệ.
- `/about` đọc `GET /pages/about`: câu chuyện resort, vị trí, tiện ích chung.

### 4.2. Phòng

- `/rooms`: thẻ từng loại phòng còn đang bán, gồm ảnh, sức chứa, giá tham khảo.
- `/rooms/:slug`: mô tả, bộ ảnh, tiện nghi, nút sang đặt phòng kèm sẵn loại phòng đó.

### 4.3. Đặt phòng

- `/booking`: chọn ngày đến, ngày đi, số khách, loại phòng đang bán, nhập họ tên và liên hệ.
- Gửi `POST /booking-requests`.
- `/booking/success`: hiện mã yêu cầu và lời nhắn resort sẽ xử lý. Trang này xác nhận hệ thống Mai Phương Resort đã ghi nhận, chưa phải xác nhận của PMS.
- Form báo lỗi ngay trên trang khi thiếu thông tin, ngày không hợp lệ, hoặc phòng không còn mở bán.

### 4.4. Điểm đến, nhà hàng, spa, ưu đãi, kho ảnh

- `/experiences`: ba nhóm điểm đến, tour và vé khu vui chơi. Mỗi mục hiện ảnh đang lưu từ quản trị.
- `/experiences/:slug`: ảnh, mô tả. Tour thêm lịch trình, thời lượng, giá. Vé thêm giá và điều kiện.
- `/restaurants` và `/restaurants/:slug`: giới thiệu, giờ mở cửa, món tiêu biểu, ảnh.
- `/spa`: giới thiệu spa, ảnh, dịch vụ.
- `/offers` và `/offers/:slug`: chương trình ưu đãi, ảnh, thời gian áp dụng.
- `/gallery`: kho ảnh khách đến MP.

Các trang này là trang giới thiệu. Chưa có giỏ hàng hay thanh toán.

### 4.5. Liên hệ

- `/contact`: form họ tên, liên hệ, nội dung, gửi `POST /contacts`.
- Hiện địa chỉ, điện thoại và bản đồ.
- Sau khi gửi thành công, khách thấy đã ghi nhận trên cùng trang.

### 4.6. Trạng thái hiển thị

Mỗi danh sách có trạng thái đang tải, danh sách rỗng, và lỗi không gọi được API. Ảnh lỗi không làm vỡ layout.

Phase 4 xong khi một người đi từ header qua đủ tám mục menu, gửi được một yêu cầu đặt phòng, gửi được một liên hệ, và thấy mã yêu cầu trên trang đã ghi nhận.

---

## Phase 5. Khu quản trị

Đường dẫn gốc `/admin`. Chưa đăng nhập thì mọi đường dẫn quản trị trừ `/admin/login` đều về trang đăng nhập.

| Đường dẫn | Việc cần chạy được |
|---|---|
| `/admin/login` | Đăng nhập, báo sai mật khẩu, giữ phiên khi tải lại trang |
| `/admin` | Số yêu cầu đặt phòng đang `new`, số liên hệ chưa đọc, lối tắt tới hai danh sách đó |
| `/admin/rooms` | Thêm, sửa, ẩn, đổi thứ tự, ảnh, giá hiển thị, sức chứa |
| `/admin/bookings` | Danh sách đơn, mở chi tiết, đổi trạng thái |
| `/admin/restaurants` | Sửa nhà hàng, giờ mở cửa, món tiêu biểu |
| `/admin/experiences` | Sửa điểm đến, tour, vé. Thêm, thay, xóa, sắp ảnh của từng mục, rồi xem lại trên `/experiences` |
| `/admin/spa` | Sửa chữ và ảnh trang spa |
| `/admin/offers` | Thêm, sửa, ẩn ưu đãi |
| `/admin/gallery` | Thêm, xóa, sắp ảnh kho và chú thích |
| `/admin/pages` | Sửa chữ và ảnh trang chủ, trang giới thiệu |
| `/admin/contacts` | Đọc tin nhắn, đánh dấu đã đọc |

Sửa một phòng trong quản trị thì `/rooms` và trang chi tiết đổi theo ngay lần tải tiếp theo. Đơn tạo từ `/booking` xuất hiện ở `/admin/bookings` với trạng thái `new`.

Phase 5 xong khi nhân viên resort, với một tài khoản, tự đổi được ảnh mục điểm đến / tour / vé, sửa được các mục menu còn lại, và xử lý được đơn cùng tin nhắn mà không cần sửa code.

---

## Phase 6. Kiểm thử trước khi lên server

Thay dữ liệu mẫu bằng nội dung resort ngay khi resort đưa đủ mục 1.5. Phần nào chưa có nội dung thì giữ dữ liệu mẫu và ghi rõ trên checklist.

Kiểm trên desktop và trên khổ điện thoại:

- Từng đường dẫn công khai trong mục 5 của tài liệu kiến trúc mở được, đúng nội dung.
- Header đi tới đủ mục. Slug sai hiện trạng thái không tìm thấy.
- Đặt phòng: gửi thành công, thiếu trường, ngày đi trước ngày đến, chọn phòng đang ẩn.
- Liên hệ: gửi thành công và gửi thiếu nội dung.
- Quản trị: sai mật khẩu, sửa nội dung rồi xem lại trang công khai, đổi trạng thái đơn, đánh dấu đã đọc.
- Gọi thẳng API quản trị khi chưa đăng nhập thì bị từ chối.
- Danh sách rỗng và ảnh không tải được vẫn còn khung trang.

Phase 6 xong khi checklist trên đạt và người phụ trách nội dung resort xem lại chữ, ảnh, giá giới thiệu trên site local hoặc site thử.

---

## Phase 7. Deploy và bàn giao

### 7.1. Một máy chủ

Một VPS khoảng 2 GB RAM trở lên chạy ba tiến trình: Next.js phục vụ giao diện, Spring Boot bằng file JAR trên cổng nội bộ, PostgreSQL giữ dữ liệu. Nginx gắn tên miền và HTTPS, chuyển lời gọi API sang Spring Boot.

Ghi địa chỉ production vào tài liệu bàn giao. Docker Compose gom được ba tiến trình khi cần dựng lại máy. Chạy trực tiếp bằng dịch vụ của hệ điều hành cũng đủ.

### 7.2. Đưa bản build lên

- Biến môi trường production cho chuỗi kết nối PostgreSQL, cổng JAR, và địa chỉ API mà Next.js gọi. Secret chỉ đặt trên server.
- Chạy migration trên PostgreSQL production.
- Build Next.js, build file JAR, trỏ tên miền, bật HTTPS.
- Tạo một tài khoản quản trị đầu tiên. Mật khẩu đưa riêng cho resort, không ghi vào tài liệu.

### 7.3. Kiểm tra trên tên miền thật

Lặp lại các lối đi của phase 6 trên đúng tên miền: mở trang chủ, xem một phòng, gửi một yêu cầu đặt phòng thử, đăng nhập quản trị và thấy đơn đó, gửi một liên hệ thử và thấy trong hộp thư.

Sau kiểm tra, xử lý hoặc hủy các đơn thử để danh sách thật không lẫn dữ liệu kiểm tra.

### 7.4. Vận hành

- Lịch sao lưu PostgreSQL và cách lấy lại một bản sao.
- Các bước đưa bản mới: build Next.js, build JAR, chạy migration, khởi động lại hai tiến trình.
- Trang ghi chú ngắn cho resort: địa chỉ đăng nhập, cách sửa phòng, cách xem đơn, cách đọc liên hệ.

Phase 7 xong khi khách mở tên miền thấy website, và một yêu cầu đặt phòng tạo trên site thật hiện trong quản trị trên server.

---

## Phase 8. Nối PMS

Phase này mở khi có tài liệu API PMS. Đến lúc đó mới chốt có làm trong đợt này hay không.

Điều kiện để nối, đã thống nhất với khách:

- API đọc được phòng trống theo ngày.
- API tạo được booking và trừ tồn ngay, trả về thành công hoặc hết phòng.
- Biết đơn phải ghi vào PMS hay vào channel manager mà Agoda đang đồng bộ cùng. Web ghi cùng chỗ với kênh đã chạy hai chiều.

Việc làm nằm ở module `pms` và nguồn dữ liệu của trang đặt phòng:

- Lúc khách chọn ngày, backend hỏi tồn và giá theo ngày từ PMS.
- Lúc khách xác nhận, backend tạo booking trên PMS rồi mới trả trang thành công.
- PMS từ chối hoặc báo hết phòng thì web không tạo lời nhắn đặt thành công.
- Trong lúc khách đang hoàn tất form, giữ phòng phía PMS theo cơ chế API cho phép, rồi kiểm tra lại đúng lần bấm xác nhận.

Các mục menu và các màn quản trị nội dung giữ nguyên. BookingRequest nội bộ còn dùng khi PMS không nhận đơn, để nhân viên vẫn thấy yêu cầu khách đã gửi.

Phase 8 xong khi một đơn tạo trên website xuất hiện trong sổ đặt phòng resort, và một phòng đã bán ở quầy hoặc Agoda không đặt thêm được trên web.
