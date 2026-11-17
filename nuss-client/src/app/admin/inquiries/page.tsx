"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useNavRouter } from "@/hooks/use-nav-router";
import { AdminInquiry, listAdminInquiries } from "@/services/admin-inquiries";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";

const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  done: "Đã xử lý",
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function snippet(text: string, max = 80) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export default function AdminInquiriesPage() {
  const router = useNavRouter();
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load(nextStatus = status) {
    try {
      const data = await listAdminInquiries(nextStatus || undefined);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>Câu hỏi khách</h1>
          <p>
            Hộp thư riêng từ form trang chủ. Mở từng câu hỏi để trả lời — hệ thống lưu ticket và gửi mail
            tới khách.
          </p>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="dash-panel">
        <div className="dash-panel-head">
          <h2>Danh sách</h2>
          <label className="inquiry-admin-filter">
            Trạng thái
            <select
              value={status}
              onChange={(event) => {
                const next = event.target.value;
                setStatus(next);
                void load(next);
              }}
            >
              <option value="">Tất cả</option>
              <option value="new">Mới</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="done">Đã xử lý</option>
            </select>
          </label>
        </div>

        {items.length === 0 ? (
          <p className="admin-muted">Chưa có câu hỏi nào.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Khách</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Câu hỏi</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{item.guestName}</td>
                    <td>{item.guestEmail}</td>
                    <td>
                      <span className={`inquiry-status is-${item.status}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </td>
                    <td>{snippet(item.question)}</td>
                    <td>
                      <Link href={`/admin/inquiries/${item.id}`}>
                        {item.status === "done" ? "Xem / sửa" : "Trả lời"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
