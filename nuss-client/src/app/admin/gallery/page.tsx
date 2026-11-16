"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin-toast";
import {
  deleteGalleryImage,
  listAdminGallery,
  reorderGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
  type AdminGalleryImage,
} from "@/services/admin-gallery";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";
import { getApiBase } from "@/services/api";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function isAllowedImage(file: File) {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  return ALLOWED_IMAGE_EXT.test(file.name);
}

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

export default function AdminGalleryPage() {
  const router = useRouter();
  const toast = useAdminToast();
  const [items, setItems] = useState<AdminGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const data = await listAdminGallery();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
        clearAdminToken();
        router.replace("/admin/login");
        return;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function onUpload(files: File[]) {
    if (files.length === 0) return;
    const invalid = files.find((file) => !isAllowedImage(file));
    if (invalid) {
      toast.error("Chỉ chấp nhận JPEG, PNG hoặc WebP");
      return;
    }
    setBusy(true);
    try {
      for (const file of files) {
        await uploadGalleryImage(file);
      }
      await load();
      toast.success(files.length > 1 ? `Đã upload ${files.length} ảnh` : "Đã upload ảnh");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onToggleActive(item: AdminGalleryImage) {
    setBusy(true);
    try {
      const updated = await updateGalleryImage(item.id, { active: !item.active });
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      toast.success(updated.active ? "Đã hiện ảnh" : "Đã ẩn ảnh");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onMove(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setItems(next);
    setBusy(true);
    try {
      const reordered = await reorderGalleryImages(next.map((item) => item.id));
      setItems(reordered);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reorder failed";
      toast.error(message);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Xóa ảnh này khỏi kho?")) return;
    setBusy(true);
    try {
      await deleteGalleryImage(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Đã xóa ảnh");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="dash">
        <p className="admin-muted">Đang tải kho ảnh…</p>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>Kho ảnh khách đến MP</h1>
          <p>Upload, sắp thứ tự và ẩn/hiện ảnh trên trang `/gallery`.</p>
        </div>
        <label className={`admin-upload-btn ${busy ? "is-disabled" : ""}`}>
          {busy ? "Đang xử lý…" : "Upload ảnh"}
          <input
            className="admin-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            multiple
            disabled={busy}
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              e.target.value = "";
              void onUpload(files);
            }}
          />
        </label>
      </div>

      {items.length === 0 ? (
        <section className="dash-panel">
          <p className="admin-muted">Chưa có ảnh. Upload JPEG/PNG/WebP để bắt đầu.</p>
        </section>
      ) : (
        <section className="dash-panel admin-media-block">
          <div className="admin-gallery is-managed">
            {items.map((item, index) => (
              <article key={item.id} className={`admin-gallery-card${item.active ? "" : " is-hidden"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(item.url)} alt="" />
                <div className="admin-gallery-card-body">
                  <div className="admin-actions">
                    <button type="button" className="admin-secondary" disabled={busy || index === 0} onClick={() => void onMove(item.id, -1)}>
                      ↑
                    </button>
                    <button
                      type="button"
                      className="admin-secondary"
                      disabled={busy || index === items.length - 1}
                      onClick={() => void onMove(item.id, 1)}
                    >
                      ↓
                    </button>
                    <button type="button" className="admin-secondary" disabled={busy} onClick={() => void onToggleActive(item)}>
                      {item.active ? "Ẩn" : "Hiện"}
                    </button>
                    <button type="button" className="admin-secondary" disabled={busy} onClick={() => void onDelete(item.id)}>
                      Xóa
                    </button>
                  </div>
                  {!item.active ? <p className="admin-hint">Đang ẩn khỏi trang công khai.</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
