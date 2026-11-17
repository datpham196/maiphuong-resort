"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAdminToast } from "@/components/admin-toast";
import { useNavRouter } from "@/hooks/use-nav-router";
import {
  AdminRestaurant,
  createMenuItem,
  deleteMenuItem,
  deleteRestaurantImage,
  getPrimaryAdminRestaurant,
  listMenuCategories,
  listMenuItems,
  MenuCategory,
  MenuItem,
  publishRestaurantContent,
  unpublishRestaurantContent,
  updateMenuItem,
  uploadRestaurantImage,
  type VenueKind,
} from "@/services/admin-restaurants";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";
import { getApiBase } from "@/services/api";

type LocaleTab = "vi" | "en";

type Props = {
  kind: VenueKind;
  title: string;
  description: string;
  adminPath: string;
};

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

function categoryLabel(category: MenuCategory, locale: LocaleTab) {
  return category.names.find((n) => n.locale === locale)?.name
    ?? category.names[0]?.name
    ?? category.code;
}

function AdminRestaurantCmsInner({ kind, title, description, adminPath }: Props) {
  const router = useNavRouter();
  const searchParams = useSearchParams();
  const toast = useAdminToast();
  const locale: LocaleTab = searchParams.get("locale") === "en" ? "en" : "vi";

  const [item, setItem] = useState<AdminRestaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [menuForm, setMenuForm] = useState({
    categoryId: "",
    nameVi: "",
    nameEn: "",
    descriptionVi: "",
    descriptionEn: "",
    priceAmount: "",
    priceLabel: "",
    active: true,
  });

  const content = useMemo(
    () => item?.contents.find((entry) => entry.locale === locale),
    [item, locale],
  );

  const imagesByRole = useMemo(() => {
    const map: Record<string, AdminRestaurant["images"]> = {
      slide: [],
      main: [],
      signature: [],
      menu: [],
    };
    for (const image of item?.images ?? []) {
      if (!map[image.role]) map[image.role] = [];
      map[image.role].push(image);
    }
    return map;
  }, [item]);

  async function load() {
    try {
      const data = await getPrimaryAdminRestaurant(kind);
      setItem(data);
      const [cats, items] = await Promise.all([listMenuCategories(data.id), listMenuItems(data.id)]);
      setCategories(cats);
      setMenuItems(items);
      if (!menuForm.categoryId && cats[0]) {
        setMenuForm((current) => ({ ...current, categoryId: cats[0].id }));
      }
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
  }, [kind, router]);

  async function onPublish() {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await publishRestaurantContent(item.id, locale);
      setItem(updated);
      toast.success("Đã xuất bản");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xuất bản thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function onUnpublish() {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await unpublishRestaurantContent(item.id, locale);
      setItem(updated);
      toast.success("Đã gỡ xuất bản");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gỡ xuất bản thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(role: string, file: File | null) {
    if (!item || !file) return;
    setSaving(true);
    try {
      await uploadRestaurantImage(item.id, role, file);
      await load();
      toast.success("Đã tải ảnh lên");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteImage(imageId: string) {
    if (!item || !window.confirm("Xóa ảnh này?")) return;
    setSaving(true);
    try {
      await deleteRestaurantImage(item.id, imageId);
      await load();
      toast.success("Đã xóa ảnh");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa ảnh thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function onCreateMenuItem(event: FormEvent) {
    event.preventDefault();
    if (!item) return;
    if (!menuForm.categoryId) {
      toast.error("Chọn phân loại món");
      return;
    }
    setSaving(true);
    try {
      await createMenuItem(item.id, {
        categoryId: menuForm.categoryId,
        nameVi: menuForm.nameVi,
        nameEn: menuForm.nameEn || menuForm.nameVi,
        descriptionVi: menuForm.descriptionVi,
        descriptionEn: menuForm.descriptionEn,
        priceAmount: menuForm.priceAmount === "" ? null : Number(menuForm.priceAmount),
        priceLabel: menuForm.priceLabel || null,
        active: menuForm.active,
        priceCurrency: "VND",
      });
      setMenuForm((current) => ({
        ...current,
        nameVi: "",
        nameEn: "",
        descriptionVi: "",
        descriptionEn: "",
        priceAmount: "",
        priceLabel: "",
      }));
      await load();
      toast.success("Đã thêm món");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thêm món thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleItem(itemRow: MenuItem) {
    if (!item) return;
    setSaving(true);
    try {
      await updateMenuItem(item.id, itemRow.id, {
        categoryId: itemRow.categoryId,
        active: !itemRow.active,
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật món thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteItem(itemId: string) {
    if (!item || !window.confirm("Xóa món này?")) return;
    setSaving(true);
    try {
      await deleteMenuItem(item.id, itemId);
      await load();
      toast.success("Đã xóa món");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa món thất bại");
    } finally {
      setSaving(false);
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
        <p className="admin-muted">Đang tải…</p>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(["vi", "en"] as LocaleTab[]).map((tab) => (
            <Link
              key={tab}
              className={`admin-btn${locale === tab ? " is-primary" : " is-secondary"}`}
              href={`${adminPath}?locale=${tab}`}
            >
              {tab.toUpperCase()}
              {item.contents.find((c) => c.locale === tab)?.cmsStatus
                ? ` · ${item.contents.find((c) => c.locale === tab)?.cmsStatus}`
                : ""}
            </Link>
          ))}
          {content?.slug || kind === "bar" ? (
            <a
              className="admin-btn"
              href={kind === "bar" ? `/${locale}/bar` : `/${locale}/restaurants/${content?.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Xem trang public
            </a>
          ) : null}
          <button type="button" className="admin-btn is-primary" disabled={saving} onClick={() => void onPublish()}>
            Xuất bản
          </button>
          <button type="button" className="admin-btn" disabled={saving} onClick={() => void onUnpublish()}>
            Gỡ xuất bản
          </button>
        </div>
      </div>

      <section className="dash-panel" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Ảnh</h2>
        {(
          [
            { role: "slide", label: "Ảnh slide (nhiều)" },
            { role: "main", label: "Ảnh chính (1)" },
            { role: "signature", label: "Ảnh món signature (1)" },
            { role: "menu", label: "Ảnh menu (nhiều)" },
          ] as const
        ).map((slot) => (
          <div key={slot.role} style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
              <strong>{slot.label}</strong>
              <label className="admin-btn is-secondary" style={{ cursor: "pointer" }}>
                Upload
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  disabled={saving}
                  onChange={(e) => void onUpload(slot.role, e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.65rem" }}>
              {(imagesByRole[slot.role] ?? []).length === 0 ? (
                <p className="admin-muted">Chưa có ảnh</p>
              ) : (
                (imagesByRole[slot.role] ?? []).map((image) => (
                  <div key={image.id} style={{ width: 140 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(image.url)}
                      alt={image.altText ?? ""}
                      style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 10 }}
                    />
                    <button
                      type="button"
                      className="admin-btn is-danger"
                      style={{ width: "100%", marginTop: 6 }}
                      onClick={() => void onDeleteImage(image.id)}
                    >
                      Xóa
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="dash-panel">
        <h2 style={{ marginTop: 0 }}>Thực đơn</h2>
        <p className="admin-muted">Menu không cần Draft/Publish — bật/tắt từng món bằng Active.</p>

        <form className="admin-form-grid" onSubmit={(event) => void onCreateMenuItem(event)} style={{ marginBottom: "1.25rem" }}>
          <label>
            Phân loại
            <select
              value={menuForm.categoryId}
              onChange={(e) => setMenuForm({ ...menuForm, categoryId: e.target.value })}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryLabel(category, locale)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tên món (vi)
            <input value={menuForm.nameVi} onChange={(e) => setMenuForm({ ...menuForm, nameVi: e.target.value })} required />
          </label>
          <label>
            Tên món (en)
            <input value={menuForm.nameEn} onChange={(e) => setMenuForm({ ...menuForm, nameEn: e.target.value })} />
          </label>
          <label>
            Mô tả (vi)
            <textarea rows={2} value={menuForm.descriptionVi} onChange={(e) => setMenuForm({ ...menuForm, descriptionVi: e.target.value })} />
          </label>
          <label>
            Mô tả (en)
            <textarea rows={2} value={menuForm.descriptionEn} onChange={(e) => setMenuForm({ ...menuForm, descriptionEn: e.target.value })} />
          </label>
          <label>
            Giá số
            <input
              type="number"
              value={menuForm.priceAmount}
              onChange={(e) => setMenuForm({ ...menuForm, priceAmount: e.target.value })}
            />
          </label>
          <label>
            Nhãn giá (vd. Giá cập nhật)
            <input value={menuForm.priceLabel} onChange={(e) => setMenuForm({ ...menuForm, priceLabel: e.target.value })} />
          </label>
          <button type="submit" className="dash-primary" disabled={saving || !menuForm.categoryId}>
            Thêm món
          </button>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Món</th>
              <th>Loại</th>
              <th>Giá</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-muted">
                  Chưa có món
                </td>
              </tr>
            ) : (
              menuItems.map((row) => {
                const name =
                  row.contents.find((c) => c.locale === locale)?.name
                  ?? row.contents[0]?.name
                  ?? "—";
                const category = categories.find((c) => c.id === row.categoryId);
                return (
                  <tr key={row.id}>
                    <td>{name}</td>
                    <td>{category ? categoryLabel(category, locale) : row.categoryCode}</td>
                    <td>
                      {row.priceLabel
                        ? row.priceLabel
                        : row.priceAmount != null
                          ? `${row.priceAmount.toLocaleString("vi-VN")} ${row.priceCurrency}`
                          : "—"}
                    </td>
                    <td>{row.active ? "Yes" : "No"}</td>
                    <td>
                      <button type="button" className="admin-btn is-ghost" onClick={() => void onToggleItem(row)}>
                        {row.active ? "Ẩn" : "Hiện"}
                      </button>{" "}
                      <button type="button" className="admin-btn is-danger" onClick={() => void onDeleteItem(row.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function AdminRestaurantCmsPage(props: Props) {
  return (
    <Suspense fallback={<div className="dash"><p className="admin-muted">Đang tải…</p></div>}>
      <AdminRestaurantCmsInner {...props} />
    </Suspense>
  );
}
