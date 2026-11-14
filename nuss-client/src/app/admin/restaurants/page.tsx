"use client";

import { AdminVenueBuilderPage } from "@/components/admin-venue-builder-page";

export default function AdminRestaurantsPage() {
  return (
    <AdminVenueBuilderPage
      kind="restaurant"
      title="Nhà hàng"
      description="Chỉnh nội dung trang giới thiệu nhà hàng trên website."
      adminPath="/admin/restaurants"
      loadingLabel="Đang mở trang Nhà hàng…"
    />
  );
}
