"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy meta URL — redirect to the single restaurant Page Builder. */
export default function AdminRestaurantMetaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/restaurants");
  }, [router]);

  return (
    <div className="dash">
      <p className="admin-muted">Đang chuyển tới trang Nhà hàng…</p>
    </div>
  );
}
