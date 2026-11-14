"use client";

import { AdminVenueBuilderPage } from "@/components/admin-venue-builder-page";

export default function AdminBarPage() {
  return (
    <AdminVenueBuilderPage
      kind="bar"
      title="Bar"
      description="Chỉnh nội dung trang giới thiệu bar trên website (hiển thị trong mục Nhà hàng)."
      adminPath="/admin/bar"
      loadingLabel="Đang mở trang Bar…"
    />
  );
}
