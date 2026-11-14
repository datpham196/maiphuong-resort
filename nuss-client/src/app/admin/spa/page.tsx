"use client";

import { AdminCmsPageBuilderPage } from "@/components/admin-cms-page-builder-page";

export default function AdminSpaPage() {
  return (
    <AdminCmsPageBuilderPage
      pageKey="spa"
      title="Spa"
      description="Chỉnh nội dung trang Spa trên website. Chỉ một bài viết — đường dẫn cố định /spa."
      adminPath="/admin/spa"
      publicPath="/spa"
      loadingLabel="Đang mở trang Spa…"
    />
  );
}
