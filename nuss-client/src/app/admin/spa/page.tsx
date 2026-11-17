"use client";

export default function AdminSpaPage() {
  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>Spa</h1>
          <p>
            Trang Spa đang dùng giao diện hard-code trên website. Phần chỉnh sửa nội dung admin sẽ bổ sung sau —
            tạm thời không dùng Page Builder / tạo bài viết.
          </p>
        </div>
        <a className="admin-btn is-primary" href="/vi/spa" target="_blank" rel="noreferrer">
          Xem trang public
        </a>
      </div>
      <section className="dash-panel">
        <p className="admin-muted" style={{ margin: 0 }}>
          Khi chốt cấu trúc CMS cho Spa (ảnh liệu trình, giá, đặt lịch…), sẽ thay hard-code bằng form quản trị
          tương tự Nhà hàng / Beach Bar.
        </p>
      </section>
    </div>
  );
}
