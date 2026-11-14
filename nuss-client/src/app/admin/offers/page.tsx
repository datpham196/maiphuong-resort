"use client";

import { AdminCmsPageBuilderPage } from "@/components/admin-cms-page-builder-page";

export default function AdminOffersPage() {
  return (
    <AdminCmsPageBuilderPage
      pageKey="offers"
      title="Ưu đãi"
      description="Chỉnh nội dung trang Ưu đãi trên website. Chỉ một bài viết — đường dẫn cố định /offers."
      adminPath="/admin/offers"
      publicPath="/offers"
      loadingLabel="Đang mở trang Ưu đãi…"
    />
  );
}
