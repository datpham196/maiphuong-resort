"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useNavRouter } from "@/hooks/use-nav-router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin-toast";
import {
  AdminRoomType,
  clearAdminToken,
  deleteRoomImage,
  getAdminRoom,
  getAdminToken,
  publishContent,
  saveContent,
  unpublishContent,
  uploadRoomImage,
} from "@/services/admin-rooms";
import { getApiBase } from "@/services/api";

type LocaleTab = "vi" | "en";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function isAllowedImage(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  // Some Windows browsers send an empty MIME type; fall back to extension.
  return ALLOWED_IMAGE_EXT.test(file.name);
}

export default function AdminRoomEditPage() {
  const params = useParams<{ id: string }>();
  const router = useNavRouter();
  const toast = useAdminToast();
  const roomId = params.id;
  const [room, setRoom] = useState<AdminRoomType | null>(null);
  const [locale, setLocale] = useState<LocaleTab>("vi");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const content = useMemo(
    () => room?.contents.find((item) => item.locale === locale),
    [room, locale],
  );

  const coverImage = useMemo(() => room?.images.find((image) => image.cover) ?? null, [room]);
  const galleryImages = useMemo(() => room?.images.filter((image) => !image.cover) ?? [], [room]);
  const coverUploadDisabled = saving || coverImage != null;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    amenities: "",
    seoTitle: "",
    seoDescription: "",
    displayOrder: "0",
  });

  async function load() {
    try {
      const data = await getAdminRoom(roomId);
      setRoom(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load room";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load by roomId
  }, [roomId, router]);

  useEffect(() => {
    if (!content) {
      setForm({
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        amenities: "",
        seoTitle: "",
        seoDescription: "",
        displayOrder: "0",
      });
      return;
    }
    setForm({
      title: content.title ?? "",
      slug: content.slug ?? "",
      shortDescription: content.shortDescription ?? "",
      description: content.description ?? "",
      amenities: (content.amenities ?? []).join(", "),
      seoTitle: content.seoTitle ?? "",
      seoDescription: content.seoDescription ?? "",
      displayOrder: String(content.displayOrder ?? 0),
    });
  }, [content]);

  function contentPayload() {
    return {
      title: form.title,
      slug: form.slug,
      shortDescription: form.shortDescription,
      description: form.description,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      displayOrder: Number(form.displayOrder) || 0,
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await saveContent(roomId, locale, contentPayload());
      setRoom(updated);
      toast.success(`Đã lưu nháp (${locale.toUpperCase()})`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function onPublish(publish: boolean) {
    setSaving(true);
    setError(null);
    try {
      // Always persist the current form first so Publish/Unpublish never drops unsaved edits.
      await saveContent(roomId, locale, contentPayload());
      const updated = publish ? await publishContent(roomId, locale) : await unpublishContent(roomId, locale);
      setRoom(updated);
      toast.success(
        publish ? `Đã lưu và xuất bản (${locale.toUpperCase()})` : `Đã lưu và gỡ xuất bản (${locale.toUpperCase()})`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function onUploadCover(files: File[]) {
    const file = files[0] ?? null;
    if (!file) {
      toast.error("Không nhận được file ảnh. Hãy chọn lại.");
      return;
    }
    if (coverImage) {
      toast.error("Đã có ảnh cover. Hãy xóa ảnh hiện tại trước khi upload ảnh khác.");
      return;
    }
    if (!isAllowedImage(file)) {
      toast.error("Chỉ chấp nhận JPEG, PNG hoặc WebP");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await uploadRoomImage(roomId, file, { asCover: true });
      await load();
      toast.success("Đã upload ảnh cover");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function onUploadGallery(files: File[]) {
    if (files.length === 0) {
      toast.error("Không nhận được file ảnh. Hãy chọn lại.");
      return;
    }
    const invalid = files.filter((file) => !isAllowedImage(file));
    if (invalid.length > 0) {
      toast.error("Chỉ chấp nhận JPEG, PNG hoặc WebP");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      for (const file of files) {
        await uploadRoomImage(roomId, file, { asCover: false });
      }
      await load();
      toast.success(files.length === 1 ? "Đã thêm 1 ảnh gallery" : `Đã thêm ${files.length} ảnh gallery`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      toast.error(message);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteImage(imageId: string, label: string) {
    setSaving(true);
    setError(null);
    try {
      await deleteRoomImage(roomId, imageId);
      await load();
      toast.success(`Đã xóa ${label}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (!room) {
    return (
      <div className="dash">
        <p>{error ?? "Đang tải…"}</p>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <Link href="/admin/rooms" className="admin-back">
            ← Danh sách
          </Link>
          <h1>{room.name}</h1>
          <p className="admin-muted">
            <code>{room.externalId}</code> · sức chứa {room.maxOccupancy ?? "—"} · giá{" "}
            {room.rackRate != null ? room.rackRate.toLocaleString("vi-VN") : "—"}
          </p>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-tabs">
        {(["vi", "en"] as LocaleTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={locale === tab ? "is-active" : undefined}
            onClick={() => setLocale(tab)}
          >
            {tab.toUpperCase()} · {room.contents.find((c) => c.locale === tab)?.cmsStatus ?? "Missing"}
          </button>
        ))}
      </div>

      <form className="dash-panel admin-form" onSubmit={onSave}>
        <label>
          Tiêu đề
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label>
          Đường dẫn (slug)
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label>
          Mô tả ngắn
          <textarea
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            rows={3}
          />
        </label>
        <label>
          Mô tả chi tiết
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={6}
          />
        </label>
        <label>
          Tiện nghi (cách nhau bằng dấu phẩy)
          <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
        </label>
        <label>
          Tiêu đề SEO
          <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
        </label>
        <label>
          Mô tả SEO
          <textarea
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            rows={2}
          />
        </label>
        <label>
          Thứ tự hiển thị
          <input value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
        </label>
        <div className="admin-actions">
          <button type="submit" className="dash-primary" disabled={saving}>
            {saving ? "Đang lưu…" : "Lưu nháp"}
          </button>
          <button type="button" className="admin-secondary" disabled={saving} onClick={() => void onPublish(true)}>
            Xuất bản
          </button>
          <button type="button" className="admin-secondary" disabled={saving} onClick={() => void onPublish(false)}>
            Gỡ xuất bản
          </button>
        </div>
      </form>

      <section className="dash-panel admin-media-block">
        <div className="admin-media-head">
          <h2>Ảnh chính (cover)</h2>
          <p className="admin-muted">Hiện trên danh sách hạng phòng. Chỉ 1 ảnh — có cover rồi phải xóa mới upload được.</p>
        </div>
        <div className="admin-actions">
          {coverUploadDisabled ? (
            <button
              type="button"
              className="dash-primary"
              disabled={saving}
              onClick={() =>
                toast.error("Đã có ảnh cover. Hãy xóa ảnh hiện tại trước khi upload ảnh khác.")
              }
            >
              Upload ảnh cover
            </button>
          ) : (
            <label className={`admin-upload-btn ${saving ? "is-disabled" : ""}`}>
              {saving ? "Đang upload…" : "Upload ảnh cover"}
              <input
                className="admin-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                disabled={saving}
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
            <img src={`${getApiBase()}${coverImage.url}`} alt={coverImage.altText ?? room.name} />
            <figcaption>
              <span className="dash-badge is-published">Cover</span>
              <button
                type="button"
                className="admin-secondary"
                disabled={saving}
                onClick={() => void onDeleteImage(coverImage.id, "ảnh cover")}
              >
                Xóa
              </button>
            </figcaption>
          </figure>
        ) : (
          <p className="admin-muted">Chưa có ảnh cover.</p>
        )}
        {coverImage ? (
          <p className="admin-hint">Upload đang bị khóa vì đã có cover. Xóa cover hiện tại để chọn ảnh khác.</p>
        ) : null}
      </section>

      <section className="dash-panel admin-media-block">
        <div className="admin-media-head">
          <h2>Gallery (trang chi tiết)</h2>
          <p className="admin-muted">Có thể chọn nhiều ảnh cùng lúc cho trang detail.</p>
        </div>
        <div className="admin-actions">
          <label className={`admin-upload-btn ${saving ? "is-disabled" : ""}`}>
            {saving ? "Đang upload…" : "Thêm ảnh gallery"}
            <input
              className="admin-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              multiple
              disabled={saving}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                e.target.value = "";
                void onUploadGallery(files);
              }}
            />
          </label>
        </div>
        <div className="admin-gallery">
          {galleryImages.map((image) => (
            <figure key={image.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${getApiBase()}${image.url}`} alt={image.altText ?? room.name} />
              <figcaption>
                <button
                  type="button"
                  className="admin-secondary"
                  disabled={saving}
                  onClick={() => void onDeleteImage(image.id, "ảnh gallery")}
                >
                  Xóa
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
        {galleryImages.length === 0 ? <p className="admin-muted">Chưa có ảnh gallery.</p> : null}
      </section>
    </div>
  );
}
