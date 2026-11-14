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
  AdminRestaurant,
  createRestaurantPreviewToken,
  deactivateAdminRestaurant,
  getPrimaryAdminRestaurant,
  publishRestaurantContent,
  saveRestaurantContent,
  unpublishRestaurantContent,
  updateAdminRestaurant,
  uploadRestaurantMedia,
  type VenueKind,
} from "@/services/admin-restaurants";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";
import { getApiBase } from "@/services/api";
import "@/styles/page-builder.css";
import "@/styles/page-builder-admin.css";

type LocaleTab = "vi" | "en";

type Props = {
  kind: VenueKind;
  title: string;
  description: string;
  adminPath: string;
  loadingLabel: string;
};

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function isAllowedImage(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  return ALLOWED_IMAGE_EXT.test(file.name);
}

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

function asDocument(value: unknown): PageDocument {
  if (!value || typeof value !== "object") return emptyDocument();
  const doc = value as PageDocument;
  if (!doc.root || doc.root.type !== "root") return emptyDocument();
  return {
    version: typeof doc.version === "number" ? doc.version : 1,
    root: doc.root,
  };
}

function AdminVenueBuilderInner({ kind, title, description, adminPath, loadingLabel }: Props) {
  const router = useNavRouter();
  const searchParams = useSearchParams();
  const toast = useAdminToast();
  const localeParam = searchParams.get("locale");
  const locale: LocaleTab = localeParam === "en" ? "en" : "vi";

  const [item, setItem] = useState<AdminRestaurant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingCover, setSavingCover] = useState(false);

  const content = useMemo(
    () => item?.contents.find((entry) => entry.locale === locale),
    [item, locale],
  );
  const coverImageUrl = item?.coverImageUrl ?? null;

  async function load() {
    try {
      const data = await getPrimaryAdminRestaurant(kind);
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
  }, [router, locale, kind]);

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
      await deactivateAdminRestaurant(item.id);
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
      await updateAdminRestaurant(item.id, { active: true });
      toast.success("Đã kích hoạt lại bài viết");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kích hoạt thất bại";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onUploadCover(files: File[]) {
    if (!item) return;
    const file = files[0] ?? null;
    if (!file) return;
    if (coverImageUrl) {
      toast.error("Đã có ảnh cover. Hãy xóa ảnh hiện tại trước khi upload ảnh khác.");
      return;
    }
    if (!isAllowedImage(file)) {
      toast.error("Chỉ chấp nhận JPEG, PNG hoặc WebP");
      return;
    }
    setSavingCover(true);
    try {
      const uploaded = await uploadRestaurantMedia(item.id, file);
      const updated = await updateAdminRestaurant(item.id, { coverImageUrl: uploaded.url });
      setItem(updated);
      toast.success("Đã upload ảnh cover");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setSavingCover(false);
    }
  }

  async function onDeleteCover() {
    if (!item || !coverImageUrl) return;
    if (!window.confirm("Xóa ảnh cover khỏi danh sách /restaurants?")) return;
    setSavingCover(true);
    try {
      // Empty string clears cover on the backend (null field is ignored).
      const updated = await updateAdminRestaurant(item.id, { coverImageUrl: "" });
      setItem(updated);
      toast.success("Đã xóa ảnh cover");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    } finally {
      setSavingCover(false);
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
          {content?.slug && item.active && content.published ? (
            <a
              className="admin-btn"
              href={`/${locale}/restaurants/${content.slug}`}
              target="_blank"
              rel="noreferrer"
            >
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

      <section className="dash-panel" style={{ marginBottom: "1rem" }}>
        <div className="admin-media-block" style={{ marginTop: 0 }}>
          <div className="admin-media-head">
            <h2 style={{ margin: 0 }}>Ảnh cover list</h2>
            <p className="admin-muted">
              Ảnh hiển thị trên danh sách `/restaurants`. Dùng chung cho cả VI và EN. Nội dung trang chi tiết dựng bằng
              Page Builder bên dưới.
            </p>
          </div>
          <div className="admin-actions">
            {coverImageUrl ? (
              <button
                type="button"
                className="dash-primary"
                disabled={savingCover}
                onClick={() => toast.error("Đã có ảnh cover. Hãy xóa ảnh hiện tại trước khi upload ảnh khác.")}
              >
                Upload ảnh cover
              </button>
            ) : (
              <label className={`admin-upload-btn ${savingCover ? "is-disabled" : ""}`}>
                {savingCover ? "Đang upload…" : "Upload ảnh cover"}
                <input
                  className="admin-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                  disabled={savingCover}
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = "";
                    void onUploadCover(files);
                  }}
                />
              </label>
            )}
          </div>
          {coverImageUrl ? (
            <figure className="admin-cover-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(coverImageUrl)} alt="Cover" />
              <figcaption>
                <span className="dash-badge is-published">Cover</span>
                <button
                  type="button"
                  className="admin-secondary"
                  disabled={savingCover}
                  onClick={() => void onDeleteCover()}
                >
                  Xóa
                </button>
              </figcaption>
            </figure>
          ) : (
            <p className="admin-muted">Chưa có ảnh cover.</p>
          )}
        </div>
      </section>

      <PageBuilderShell
        key={`${item.id}-${locale}-${item.active ? "on" : "off"}`}
        locale={locale}
        title={content?.title ?? ""}
        slug={content?.slug ?? ""}
        shortDescription={content?.shortDescription ?? ""}
        initialDocument={asDocument(content?.documentDraft)}
        api={
          {
            saveContent: (loc, payload) => saveRestaurantContent(item.id, loc, payload),
            publishContent: (loc) => publishRestaurantContent(item.id, loc),
            unpublishContent: (loc) => unpublishRestaurantContent(item.id, loc),
            createPreviewToken: (loc) => createRestaurantPreviewToken(item.id, loc),
            uploadMedia: (file) => uploadRestaurantMedia(item.id, file),
            previewPath: (loc, token) =>
              `/${loc}/restaurants/preview?token=${encodeURIComponent(token)}`,
          } satisfies PageBuilderApi
        }
        onSaved={() => void load()}
      />
    </div>
  );
}

export function AdminVenueBuilderPage(props: Props) {
  return (
    <Suspense fallback={<div className="dash"><p className="admin-muted">{props.loadingLabel}</p></div>}>
      <AdminVenueBuilderInner {...props} />
    </Suspense>
  );
}
