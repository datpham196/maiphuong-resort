"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useNavRouter } from "@/hooks/use-nav-router";
import Link from "next/link";
import { PageBuilderShell } from "@/components/page-builder/PageBuilderShell";
import type { PageBuilderApi } from "@/components/page-builder/page-builder-api";
import { emptyDocument, type PageDocument } from "@/components/page-builder/types";
import { useAdminToast } from "@/components/admin-toast";
import {
  createCmsPagePreviewToken,
  deactivateAdminCmsPage,
  getAdminCmsPage,
  publishCmsPageContent,
  saveCmsPageContent,
  unpublishCmsPageContent,
  updateAdminCmsPage,
  uploadCmsPageMedia,
  type AdminCmsPage,
  type CmsPageKey,
} from "@/services/admin-cms-pages";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";
import "@/styles/page-builder.css";
import "@/styles/page-builder-admin.css";

type LocaleTab = "vi" | "en";

type Props = {
  pageKey: CmsPageKey;
  title: string;
  description: string;
  adminPath: string;
  publicPath: string;
  loadingLabel: string;
};

function asDocument(value: unknown): PageDocument {
  if (!value || typeof value !== "object") return emptyDocument();
  const doc = value as PageDocument;
  if (!doc.root || doc.root.type !== "root") return emptyDocument();
  return {
    version: typeof doc.version === "number" ? doc.version : 1,
    root: doc.root,
  };
}

function AdminCmsPageBuilderInner({
  pageKey,
  title,
  description,
  adminPath,
  publicPath,
  loadingLabel,
}: Props) {
  const router = useNavRouter();
  const searchParams = useSearchParams();
  const toast = useAdminToast();
  const localeParam = searchParams.get("locale");
  const locale: LocaleTab = localeParam === "en" ? "en" : "vi";

  const [item, setItem] = useState<AdminCmsPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const content = useMemo(
    () => item?.contents.find((entry) => entry.locale === locale),
    [item, locale],
  );

  async function load() {
    try {
      const data = await getAdminCmsPage(pageKey);
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
  }, [router, locale, pageKey]);

  async function onDeactivate() {
    if (!item) return;
    if (
      !window.confirm(
        "Vô hiệu hóa bài viết này? Toàn bộ locale sẽ ẩn khỏi website công khai cho đến khi kích hoạt lại.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await deactivateAdminCmsPage(pageKey);
      toast.success("Đã vô hiệu hóa bài viết");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Vô hiệu hóa thất bại";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onActivate() {
    if (!item) return;
    setBusy(true);
    try {
      await updateAdminCmsPage(pageKey, { active: true });
      toast.success("Đã kích hoạt lại bài viết");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kích hoạt thất bại";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

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
        <p className="admin-muted">{loadingLabel}</p>
      </div>
    );
  }

  return (
    <div className="dash pb-admin-page">
      <div className="dash-head" style={{ marginBottom: "0.75rem" }}>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
          {!item.active ? (
            <p className="admin-error" style={{ marginTop: "0.5rem" }}>
              Bài viết đang bị vô hiệu hóa — không hiện trên website công khai.
            </p>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {(["vi", "en"] as LocaleTab[]).map((tab) => {
            const status = item.contents.find((c) => c.locale === tab)?.cmsStatus;
            return (
              <Link
                key={tab}
                className={`admin-btn${locale === tab ? " is-primary" : " is-secondary"}`}
                href={`${adminPath}?locale=${tab}`}
              >
                {tab.toUpperCase()}
                {status ? ` · ${status}` : ""}
              </Link>
            );
          })}
          {item.active && content?.published ? (
            <a className="admin-btn" href={`/${locale}${publicPath}`} target="_blank" rel="noreferrer">
              Xem trang public
            </a>
          ) : null}
          {item.active ? (
            <button type="button" className="admin-btn is-danger" disabled={busy} onClick={() => void onDeactivate()}>
              Vô hiệu hóa bài
            </button>
          ) : (
            <button type="button" className="admin-btn is-primary" disabled={busy} onClick={() => void onActivate()}>
              Kích hoạt lại
            </button>
          )}
        </div>
      </div>

      <PageBuilderShell
        key={`${item.id}-${locale}-${item.active ? "on" : "off"}`}
        locale={locale}
        title={content?.title ?? ""}
        slug={pageKey}
        shortDescription={content?.shortDescription ?? ""}
        hideSlug
        initialDocument={asDocument(content?.documentDraft)}
        api={
          {
            saveContent: (loc, payload) =>
              saveCmsPageContent(pageKey, loc, { ...payload, slug: pageKey }),
            publishContent: (loc) => publishCmsPageContent(pageKey, loc),
            unpublishContent: (loc) => unpublishCmsPageContent(pageKey, loc),
            createPreviewToken: (loc) => createCmsPagePreviewToken(pageKey, loc),
            uploadMedia: (file) => uploadCmsPageMedia(pageKey, file),
            previewPath: (loc, token) =>
              `/${loc}${publicPath}/preview?token=${encodeURIComponent(token)}`,
          } satisfies PageBuilderApi
        }
        onSaved={() => void load()}
      />
    </div>
  );
}

export function AdminCmsPageBuilderPage(props: Props) {
  return (
    <Suspense fallback={<div className="dash"><p className="admin-muted">{props.loadingLabel}</p></div>}>
      <AdminCmsPageBuilderInner {...props} />
    </Suspense>
  );
}
