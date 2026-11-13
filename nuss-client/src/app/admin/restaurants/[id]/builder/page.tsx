"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") === "en" ? "en" : "vi";

  useEffect(() => {
    router.replace(`/admin/restaurants?locale=${locale}`);
  }, [router, locale]);

  return <p className="admin-muted">Đang chuyển tới trang Nhà hàng…</p>;
}

/** Legacy builder URL — redirect to the single restaurant editor. */
export default function AdminRestaurantBuilderRedirectPage() {
  return (
    <Suspense fallback={<p className="admin-muted">Đang chuyển tới trang Nhà hàng…</p>}>
      <div className="dash">
        <RedirectInner />
      </div>
    </Suspense>
  );
}
