"use client";

import { useEffect } from "react";
import { useNavRouter } from "@/hooks/use-nav-router";

/** Legacy meta URL — redirect to the single restaurant Page Builder. */
export default function AdminRestaurantMetaRedirectPage() {
  const router = useNavRouter();

  useEffect(() => {
    router.replace("/admin/restaurants");
  }, [router]);

  return (
    <div className="dash">
      <p className="admin-muted">Đang chuyển tới trang Nhà hàng…</p>
    </div>
  );
}
