"use client";

export default function AdminOffersPage() {
  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>Ưu đãi</h1>
          <p>
            Trang Ưu đãi đang dùng giao diện hard-code trên website. Phần chỉnh sửa nội dung admin sẽ bổ sung sau —
            tạm thời không dùng Page Builder / tạo bài viết.
          </p>
        </div>
        <a className="admin-btn is-primary" href="/vi/offers" target="_blank" rel="noreferrer">
          Xem trang public
        </a>
      </div>
      <section className="dash-panel">
        <p className="admin-muted" style={{ margin: 0 }}>
          Khi chốt cấu trúc CMS cho Ưu đãi (gói, ngày áp dụng, giá…), sẽ thay hard-code bằng form quản trị.
        </p>
      </section>
    </div>
  );
}
