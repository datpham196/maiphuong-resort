"use client";

import Link from "next/link";
import { useNavRouter } from "@/hooks/use-nav-router";
import { FormEvent, useEffect, useState } from "react";
import { useAdminToast } from "@/components/admin-toast";
import {
  AdminExperience,
  createAdminExperience,
  listAdminExperiences,
} from "@/services/admin-experiences";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";

const GROUP_LABEL: Record<string, string> = {
  destination: "Điểm đến",
  tour: "Tour",
  ticket: "Vé",
};

export default function AdminExperiencesPage() {
  const router = useNavRouter();
  const toast = useAdminToast();
  const [items, setItems] = useState<AdminExperience[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    group: "destination",
    title: "",
    slug: "",
  });

  async function load() {
    try {
      const data = await listAdminExperiences();
      setItems(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      if (message.toLowerCase().includes("unauthorized") || message.includes("401")) {
        clearAdminToken();
        router.replace("/admin/login");
        return;
      }
      setError(message);
    }
  }

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    void load();
  }, [router]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const created = await createAdminExperience({
        group: form.group,
        locale: "vi",
        content: {
          title: form.title,
          slug: form.slug,
        },
      });
      toast.success("Đã tạo bài viết");
      router.push(`/admin/experiences/${created.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      setError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>Điểm đến / tour / vé</h1>
          <p>Tạo bài theo nhóm, rồi mở Page Builder để dựng nội dung tùy thích.</p>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="dash-panel" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Tạo bài mới</h2>
        <form className="admin-form-grid" onSubmit={(event) => void onCreate(event)}>
          <label>
            Nhóm
            <select
              value={form.group}
              onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))}
            >
              <option value="destination">Điểm đến</option>
              <option value="tour">Tour</option>
              <option value="ticket">Vé khu vui chơi</option>
            </select>
          </label>
          <label>
            Tiêu đề (vi)
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Slug (vi)
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              required
            />
          </label>
          <button type="submit" className="dash-primary" disabled={creating}>
            {creating ? "Đang tạo…" : "Tạo bài"}
          </button>
        </form>
      </section>

      <section className="dash-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề (vi)</th>
              <th>Nhóm</th>
              <th>Active</th>
              <th>CMS vi</th>
              <th>CMS en</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const vi = item.contents.find((content) => content.locale === "vi");
              const en = item.contents.find((content) => content.locale === "en");
              return (
                <tr key={item.id}>
                  <td>{vi?.title ?? "—"}</td>
                  <td>{GROUP_LABEL[item.group] ?? item.group}</td>
                  <td>{item.active ? "Yes" : "No"}</td>
                  <td>{vi?.cmsStatus ?? "Missing"}</td>
                  <td>{en?.cmsStatus ?? "Missing"}</td>
                  <td>
                    <Link href={`/admin/experiences/${item.id}`}>Sửa</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
