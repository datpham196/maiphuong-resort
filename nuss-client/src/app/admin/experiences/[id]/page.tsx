"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin-toast";
import {
  AdminExperience,
  deactivateAdminExperience,
  deleteExperienceImage,
  getAdminExperience,
  publishExperienceContent,
  saveExperienceContent,
  unpublishExperienceContent,
  updateAdminExperience,
  uploadExperienceImage,
} from "@/services/admin-experiences";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";
import { getApiBase } from "@/services/api";

type LocaleTab = "vi" | "en";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function isAllowedImage(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  return ALLOWED_IMAGE_EXT.test(file.name);
}

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

export default function AdminExperienceEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useAdminToast();
  const experienceId = params.id;
  const [item, setItem] = useState<AdminExperience | null>(null);
  const [locale, setLocale] = useState<LocaleTab>("vi");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ group: "destination", layout: "layout1", displayOrder: "0", active: true });

  const content = useMemo(
    () => item?.contents.find((entry) => entry.locale === locale),
    [item, locale],
  );
  const coverImage = useMemo(() => item?.images.find((image) => image.cover) ?? null, [item]);
  const galleryImages = useMemo(() => item?.images.filter((image) => !image.cover) ?? [], [item]);
  const coverUploadDisabled = saving || coverImage != null;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    itinerary: "",
    durationText: "",
    priceAmount: "",
    priceCurrency: "VND",
    priceNote: "",
    conditions: "",
    seoTitle: "",
    seoDescription: "",
  });

  async function load() {
    try {
      const data = await getAdminExperience(experienceId);
      setItem(data);
      setMeta({
        group: data.group,
        layout: data.layout,
        displayOrder: String(data.displayOrder ?? 0),
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
  }, [experienceId, router]);

  useEffect(() => {
    if (!content) {
      setForm({
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        itinerary: "",
        durationText: "",
        priceAmount: "",
        priceCurrency: "VND",
        priceNote: "",
        conditions: "",
        seoTitle: "",
        seoDescription: "",
      });
      return;
    }
    setForm({
      title: content.title ?? "",
      slug: content.slug ?? "",
      shortDescription: content.shortDescription ?? "",
      description: content.description ?? "",
      itinerary: content.itinerary ?? "",
      durationText: content.durationText ?? "",
      priceAmount: content.priceAmount != null ? String(content.priceAmount) : "",
      priceCurrency: content.priceCurrency ?? "VND",
      priceNote: content.priceNote ?? "",
      conditions: content.conditions ?? "",
      seoTitle: content.seoTitle ?? "",
      seoDescription: content.seoDescription ?? "",
    });
  }, [content]);

  function contentPayload() {
    return {
      title: form.title,
      slug: form.slug,
      shortDescription: form.shortDescription,
      description: form.description,
      itinerary: form.itinerary,
      durationText: form.durationText,
      priceAmount: form.priceAmount === "" ? null : Number(form.priceAmount),
      priceCurrency: form.priceCurrency,
      priceNote: form.priceNote,
      conditions: form.conditions,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
    };
  }

  async function onSaveMeta(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminExperience(experienceId, {
        group: meta.group,
        layout: meta.layout,
        displayOrder: Number(meta.displayOrder) || 0,
        active: meta.active,
      });
      setItem(updated);
      toast.success("Đã lưu nhóm / layout");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await saveExperienceContent(experienceId, locale, contentPayload());
      setItem(updated);
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
      await saveExperienceContent(experienceId, locale, contentPayload());
      const updated = publish
        ? await publishExperienceContent(experienceId, locale)
        : await unpublishExperienceContent(experienceId, locale);
      setItem(updated);
      toast.success(publish ? `Đã publish (${locale.toUpperCase()})` : `Đã unpublish (${locale.toUpperCase()})`);
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
      await uploadExperienceImage(experienceId, file, undefined, true);
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
        await uploadExperienceImage(experienceId, file, undefined, false);
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
      await deleteExperienceImage(experienceId, imageId);
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

  async function onDeactivate() {
    if (!window.confirm("Ẩn bài này khỏi danh sách công khai?")) return;
    setSaving(true);
    try {
      await deactivateAdminExperience(experienceId);
      toast.success("Đã ẩn bài");
      router.push("/admin/experiences");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deactivate failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (!item) {
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
          <p className="admin-muted" style={{ margin: 0 }}>
            <Link href="/admin/experiences">← Danh sách</Link>
          </p>
          <h1>{content?.title ?? "Sửa bài experiences"}</h1>
          <p>
            Status {locale.toUpperCase()}: <strong>{content?.cmsStatus ?? "Missing"}</strong>
          </p>
        </div>
        <button type="button" className="admin-logout" onClick={() => void onDeactivate()} disabled={saving}>
          Ẩn bài
        </button>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="dash-panel" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Nhóm & layout</h2>
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
            Layout
            <select
              value={meta.layout}
              onChange={(event) => setMeta((current) => ({ ...current, layout: event.target.value }))}
            >
              <option value="layout1">Layout 1</option>
              <option value="layout2">Layout 2</option>
              <option value="layout3">Layout 3</option>
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
          <button type="submit" className="dash-primary" disabled={saving}>
            Lưu nhóm / layout
          </button>
        </form>
      </section>

      <div className="admin-tabs" style={{ marginBottom: "1rem" }}>
        {(["vi", "en"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={locale === tab ? "is-active" : undefined}
            onClick={() => setLocale(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <section className="dash-panel" style={{ marginBottom: "1rem" }}>
        <form className="admin-form-grid" onSubmit={(event) => void onSave(event)}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label>
            Slug
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            />
          </label>
          <label className="admin-span-2">
            Short description
            <textarea
              rows={2}
              value={form.shortDescription}
              onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
            />
          </label>
          <label className="admin-span-2">
            Description
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="admin-span-2">
            Itinerary
            <textarea
              rows={4}
              value={form.itinerary}
              onChange={(event) => setForm((current) => ({ ...current, itinerary: event.target.value }))}
            />
          </label>
          <label>
            Duration
            <input
              value={form.durationText}
              onChange={(event) => setForm((current) => ({ ...current, durationText: event.target.value }))}
            />
          </label>
          <label>
            Price
            <input
              value={form.priceAmount}
              onChange={(event) => setForm((current) => ({ ...current, priceAmount: event.target.value }))}
            />
          </label>
          <label>
            Currency
            <input
              value={form.priceCurrency}
              onChange={(event) => setForm((current) => ({ ...current, priceCurrency: event.target.value }))}
            />
          </label>
          <label>
            Price note
            <input
              value={form.priceNote}
              onChange={(event) => setForm((current) => ({ ...current, priceNote: event.target.value }))}
            />
          </label>
          <label className="admin-span-2">
            Conditions
            <textarea
              rows={3}
              value={form.conditions}
              onChange={(event) => setForm((current) => ({ ...current, conditions: event.target.value }))}
            />
          </label>
          <label>
            SEO title
            <input
              value={form.seoTitle}
              onChange={(event) => setForm((current) => ({ ...current, seoTitle: event.target.value }))}
            />
          </label>
          <label>
            SEO description
            <input
              value={form.seoDescription}
              onChange={(event) => setForm((current) => ({ ...current, seoDescription: event.target.value }))}
            />
          </label>
          <div className="admin-actions admin-span-2">
            <button type="submit" className="dash-primary" disabled={saving}>
              Lưu nháp
            </button>
            <button type="button" onClick={() => void onPublish(true)} disabled={saving}>
              Publish
            </button>
            <button type="button" onClick={() => void onPublish(false)} disabled={saving}>
              Unpublish
            </button>
          </div>
        </form>
      </section>

      <section className="dash-panel admin-media-block">
        <div className="admin-media-head">
          <h2>Ảnh chính (cover)</h2>
          <p className="admin-muted">Hiện trên danh sách experiences. Chỉ 1 ảnh — có cover rồi phải xóa mới upload được.</p>
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
            <img src={mediaUrl(coverImage.url)} alt={coverImage.altText ?? content?.title ?? ""} />
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
              <img src={mediaUrl(image.url)} alt={image.altText ?? content?.title ?? ""} />
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
