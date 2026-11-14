"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useNavRouter } from "@/hooks/use-nav-router";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { PageBuilderShell } from "@/components/page-builder/PageBuilderShell";
import type { PageBuilderApi } from "@/components/page-builder/page-builder-api";
import { emptyDocument, type PageDocument } from "@/components/page-builder/types";
import { useAdminToast } from "@/components/admin-toast";
import {
  AdminExperience,
  createExperiencePreviewToken,
  deactivateAdminExperience,
  deleteExperienceImage,
  getAdminExperience,
  publishExperienceContent,
  saveExperienceContent,
  updateAdminExperience,
  uploadExperienceImage,
  uploadExperienceMedia,
} from "@/services/admin-experiences";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";
import { getApiBase } from "@/services/api";
import "@/styles/page-builder.css";
import "@/styles/page-builder-admin.css";

type LocaleTab = "vi" | "en";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function isAllowedImage(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  return ALLOWED_IMAGE_EXT.test(file.name);
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

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

function AdminExperienceBuilderInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useNavRouter();
  const toast = useAdminToast();
  const experienceId = params.id;
  const localeParam = searchParams.get("locale");
  const locale: LocaleTab = localeParam === "en" ? "en" : "vi";

  const [item, setItem] = useState<AdminExperience | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [meta, setMeta] = useState({ group: "destination", displayOrder: "0", active: true });

  const content = useMemo(
    () => item?.contents.find((entry) => entry.locale === locale),
    [item, locale],
  );
  const coverImage = useMemo(() => item?.images.find((image) => image.cover) ?? null, [item]);

  async function load() {
    try {
      const data = await getAdminExperience(experienceId);
      setItem(data);
      setMeta({
        group: data.group,
        displayOrder: String(data.displayOrder),
        active: data.active,
      });
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
  }, [experienceId, router, locale]);

  async function onSaveMeta(event: FormEvent) {
    event.preventDefault();
    setSavingMeta(true);
    try {
      const updated = await updateAdminExperience(experienceId, {
        group: meta.group,
        displayOrder: Number(meta.displayOrder) || 0,
        active: meta.active,
      });
      setItem(updated);
      toast.success("Đã lưu nhóm / trạng thái");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    } finally {
      setSavingMeta(false);
    }
  }

  async function onUploadCover(files: File[]) {
    const file = files[0] ?? null;
    if (!file) return;
    if (coverImage) {
      toast.error("Đã có ảnh cover. Hãy xóa ảnh hiện tại trước khi upload ảnh khác.");
      return;
    }
    if (!isAllowedImage(file)) {
      toast.error("Chỉ chấp nhận JPEG, PNG hoặc WebP");
      return;
    }
    setSavingMeta(true);
    try {
      await uploadExperienceImage(experienceId, file, undefined, true);
      await load();
      toast.success("Đã upload ảnh cover");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setSavingMeta(false);
    }
  }

  async function onDeleteCover() {
    if (!coverImage) return;
    setSavingMeta(true);
    try {
      await deleteExperienceImage(experienceId, coverImage.id);
      await load();
      toast.success("Đã xóa ảnh cover");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    } finally {
      setSavingMeta(false);
    }
  }

  async function onDeactivate() {
    if (!window.confirm("Ẩn bài này khỏi danh sách công khai?")) return;
    setSavingMeta(true);
    try {
      await deactivateAdminExperience(experienceId);
      toast.success("Đã ẩn bài");
      router.push("/admin/experiences");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deactivate failed";
      toast.error(message);
    } finally {
      setSavingMeta(false);
    }
  }

  const builderApi: PageBuilderApi = {
    saveContent: (loc, payload) => saveExperienceContent(experienceId, loc, payload),
    publishContent: (loc) => publishExperienceContent(experienceId, loc),
    createPreviewToken: (loc) => createExperiencePreviewToken(experienceId, loc),
    uploadMedia: (file) => uploadExperienceMedia(experienceId, file),
    previewPath: (loc, token) => `/${loc}/experiences/preview?token=${encodeURIComponent(token)}`,
  };

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
        <p className="admin-muted">Đang mở bài experiences…</p>
      </div>
    );
  }

  return (
    <div className="dash pb-admin-page">
      <div className="dash-head" style={{ marginBottom: "0.75rem" }}>
        <div>
          <p className="admin-muted" style={{ margin: 0 }}>
            <Link href="/admin/experiences">← Danh sách</Link>
          </p>
          <h1>{content?.title ?? "Sửa bài experiences"}</h1>
          <p>Dùng Page Builder để dựng nội dung trang chi tiết theo ý.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {(["vi", "en"] as LocaleTab[]).map((tab) => {
            const status = item.contents.find((c) => c.locale === tab)?.cmsStatus;
            return (
              <Link
                key={tab}
                className={`admin-btn${locale === tab ? " is-primary" : " is-secondary"}`}
                href={`/admin/experiences/${experienceId}?locale=${tab}`}
              >
                {tab.toUpperCase()}
                {status ? ` · ${status}` : ""}
              </Link>
            );
          })}
          {content?.slug ? (
            <a
              className="admin-btn"
              href={`/${locale}/experiences/${content.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Xem trang public
            </a>
          ) : null}
          <button type="button" className="admin-logout" onClick={() => void onDeactivate()} disabled={savingMeta}>
            Ẩn bài
          </button>
        </div>
      </div>

      <section className="dash-panel" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Nhóm & ảnh cover (list)</h2>
        <form className="admin-form-grid" onSubmit={(event) => void onSaveMeta(event)}>
          <label>
            Nhóm
            <select
              value={meta.group}
              onChange={(event) => setMeta((current) => ({ ...current, group: event.target.value }))}
            >
              <option value="destination">Điểm đến</option>
              <option value="tour">Tour</option>
              <option value="ticket">Vé</option>
            </select>
          </label>
          <label>
            Thứ tự
            <input
              value={meta.displayOrder}
              onChange={(event) => setMeta((current) => ({ ...current, displayOrder: event.target.value }))}
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={meta.active}
              onChange={(event) => setMeta((current) => ({ ...current, active: event.target.checked }))}
            />
            Active
          </label>
          <div className="admin-actions admin-span-2">
            <button type="submit" className="dash-primary" disabled={savingMeta}>
              Lưu nhóm / trạng thái
            </button>
          </div>
        </form>

        <div className="admin-media-block" style={{ marginTop: "1rem" }}>
          <div className="admin-media-head">
            <h3 style={{ margin: 0 }}>Ảnh cover list</h3>
            <p className="admin-muted">Ảnh hiển thị trên danh sách `/experiences`. Nội dung trang chi tiết dựng bằng Page Builder.</p>
          </div>
          <div className="admin-actions">
            {coverImage ? (
              <button
                type="button"
                className="dash-primary"
                disabled={savingMeta}
                onClick={() => toast.error("Đã có ảnh cover. Hãy xóa ảnh hiện tại trước khi upload ảnh khác.")}
              >
                Upload ảnh cover
              </button>
            ) : (
              <label className={`admin-upload-btn ${savingMeta ? "is-disabled" : ""}`}>
                {savingMeta ? "Đang upload…" : "Upload ảnh cover"}
                <input
                  className="admin-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                  disabled={savingMeta}
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = "";
                    void onUploadCover(files);
                  }}
                />
              </label>
            )}
          </div>
          {coverImage ? (
            <figure className="admin-cover-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(coverImage.url)} alt={coverImage.altText ?? ""} />
              <figcaption>
                <span className="dash-badge is-published">Cover</span>
                <button type="button" className="admin-secondary" disabled={savingMeta} onClick={() => void onDeleteCover()}>
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
        key={`${item.id}-${locale}`}
        locale={locale}
        title={content?.title ?? ""}
        slug={content?.slug ?? ""}
        shortDescription={content?.shortDescription ?? ""}
        initialDocument={asDocument(content?.documentDraft)}
        api={builderApi}
        onSaved={() => void load()}
      />
    </div>
  );
}

export default function AdminExperienceEditPage() {
  return (
    <Suspense
      fallback={
        <div className="dash">
          <p className="admin-muted">Đang mở bài experiences…</p>
        </div>
      }
    >
      <AdminExperienceBuilderInner />
    </Suspense>
  );
}
