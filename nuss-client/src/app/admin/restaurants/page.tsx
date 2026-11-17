"use client";

import { AdminRestaurantCmsPage } from "@/components/admin-restaurant-cms-page";

export default function AdminRestaurantsPage() {
  return (
    <AdminRestaurantCmsPage
      kind="restaurant"
      title="Nhà hàng"
      description="Cập nhật ảnh và thực đơn trang nhà hàng trên website."
      adminPath="/admin/restaurants"
    />
  );
}
