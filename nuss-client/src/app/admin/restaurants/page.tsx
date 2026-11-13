"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageBuilderShell } from "@/components/page-builder/PageBuilderShell";
import { emptyDocument, type PageDocument } from "@/components/page-builder/types";
import { useAdminToast } from "@/components/admin-toast";
import { AdminRestaurant, getPrimaryAdminRestaurant } from "@/services/admin-restaurants";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";
import "@/styles/page-builder.css";
import "@/styles/page-builder-admin.css";

type LocaleTab = "vi" | "en";

function asDocument(value: unknown): PageDocument {
  if (!value || typeof value !== "object") return emptyDocument();
  const doc = value as PageDocument;
  if (!doc.root || doc.root.type !== "root") return emptyDocument();
  return {
    version: typeof doc.version === "number" ? doc.version : 1,
    root: doc.root,
  };
}

function AdminRestaurantBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useAdminToast();
  const localeParam = searchParams.get("locale");
  const locale: LocaleTab = localeParam === "en" ? "en" : "vi";

  const [item, setItem] = useState<AdminRestaurant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const content = useMemo(
    () => item?.contents.find((entry) => entry.locale === locale),
    [item, locale],
  );

  async function load() {
    try {
      const data = await getPrimaryAdminRestaurant();
      setItem(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
        clearAdminToken();
        router.replace("/admin/login");
        return;
      }
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, locale]);

  if (error) {
    return (
      <div className="dash">
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="dash">
        <p className="admin-muted">Đang mở trang Nhà hàng…</p>
      </div>
    );
  }

  return (
    <div className="dash pb-admin-page">
      <div className="dash-head" style={{ marginBottom: "0.75rem" }}>
        <div>
          <h1>Nhà hàng</h1>
          <p>Chỉnh nội dung trang giới thiệu nhà hàng trên website.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {(["vi", "en"] as LocaleTab[]).map((tab) => {
            const status = item.contents.find((c) => c.locale === tab)?.cmsStatus;
            return (
              <Link
                key={tab}
                className={`admin-btn${locale === tab ? " is-primary" : " is-secondary"}`}
                href={`/admin/restaurants?locale=${tab}`}
              >
                {tab.toUpperCase()}
                {status ? ` · ${status}` : ""}
              </Link>
            );
          })}
          {content?.slug ? (
            <a
              className="admin-btn"
              href={`/${locale}/restaurants/${content.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Xem trang public
            </a>
          ) : null}
        </div>
      </div>

      <PageBuilderShell
        key={`${item.id}-${locale}`}
        restaurantId={item.id}
        locale={locale}
        title={content?.title ?? ""}
        slug={content?.slug ?? ""}
        shortDescription={content?.shortDescription ?? ""}
        initialDocument={asDocument(content?.documentDraft)}
        onSaved={() => void load()}
      />
    </div>
  );
}

export default function AdminRestaurantsPage() {
  return (
    <Suspense fallback={<div className="dash"><p className="admin-muted">Đang mở trang Nhà hàng…</p></div>}>
      <AdminRestaurantBuilderInner />
    </Suspense>
  );
}
