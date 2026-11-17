"use client";

import { AdminRestaurantCmsPage } from "@/components/admin-restaurant-cms-page";

export default function AdminBarPage() {
  return (
    <AdminRestaurantCmsPage
      kind="bar"
      title="Bar"
      description="Cập nhật ảnh và thực đơn trang Beach Bar trên website."
      adminPath="/admin/bar"
    />
  );
}
