"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminToast } from "@/components/admin-toast";
import { useNavRouter } from "@/hooks/use-nav-router";
import {
  AdminInquiry,
  getAdminInquiry,
  updateAdminInquiry,
} from "@/services/admin-inquiries";
import { clearAdminToken, getAdminToken } from "@/services/admin-rooms";

const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  done: "Đã xử lý",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminInquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useNavRouter();
  const toast = useAdminToast();
  const inquiryId = params.id;

  const [item, setItem] = useState<AdminInquiry | null>(null);
  const [status, setStatus] = useState("new");
  const [staffAnswer, setStaffAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  async function load() {
    try {
      const data = await getAdminInquiry(inquiryId);
      setItem(data);
      setStatus(data.status);
      setStaffAnswer(data.staffAnswer ?? "");
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
  }, [router, inquiryId]);

  async function persist(options: { sendToGuest: boolean }) {
    const busy = options.sendToGuest ? setSending : setSaving;
    if (options.sendToGuest && !staffAnswer.trim()) {
      const message = "Vui lòng nhập câu trả lời trước khi gửi.";
      setError(message);
      toast.error(message);
      return;
    }

    busy(true);
    setError(null);
    try {
      const updated = await updateAdminInquiry(inquiryId, {
        status,
        staffAnswer,
        sendToGuest: options.sendToGuest,
      });
      setItem(updated);
      setStatus(updated.status);
      setStaffAnswer(updated.staffAnswer ?? "");
      toast.success(
        options.sendToGuest
          ? "Đã lưu và gửi mail trả lời cho khách"
          : "Đã lưu (không gửi mail)",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      busy(false);
    }
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    await persist({ sendToGuest: false });
  }

  async function onSendReply() {
    await persist({ sendToGuest: true });
  }

  const busy = saving || sending;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <Link href="/admin/inquiries" className="admin-secondary inquiry-back-btn">
            ← Quay lại danh sách
          </Link>
          <h1>{item?.guestName ?? "Chi tiết câu hỏi"}</h1>
          <p>
            Có thể chỉ đổi trạng thái rồi Lưu, hoặc Gửi câu trả lời để lưu và gửi mail tới khách.
          </p>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {!item ? (
        <section className="dash-panel">
          <p className="admin-muted">Đang tải…</p>
        </section>
      ) : (
        <>
          <section className="dash-panel" style={{ marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>Thông tin khách</h2>
            <dl className="inquiry-detail-meta">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${item.guestEmail}`}>{item.guestEmail}</a>
                </dd>
              </div>
              <div>
                <dt>Điện thoại</dt>
                <dd>
                  {item.guestPhone ? (
                    <a href={`tel:${item.guestPhone}`}>{item.guestPhone}</a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt>Gửi lúc</dt>
                <dd>{formatDate(item.createdAt)}</dd>
              </div>
              <div>
                <dt>Trạng thái hiện tại</dt>
                <dd>
                  <span className={`inquiry-status is-${item.status}`}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Trả lời lúc</dt>
                <dd>{formatDate(item.answeredAt)}</dd>
              </div>
            </dl>

            <h3 className="inquiry-question-label">Câu hỏi</h3>
            <p className="inquiry-question-body">{item.question}</p>
          </section>

          <section className="dash-panel">
            <h2 style={{ marginTop: 0 }}>Trả lời khách</h2>
            <form className="admin-form-grid" onSubmit={(event) => void onSave(event)}>
              <label>
                Trạng thái
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={busy}
                >
                  <option value="new">Mới</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="done">Đã xử lý</option>
                </select>
              </label>
              <label className="admin-span-2">
                Câu trả lời
                <textarea
                  rows={6}
                  value={staffAnswer}
                  onChange={(event) => setStaffAnswer(event.target.value)}
                  placeholder="Nội dung trả lời khách (bắt buộc nếu bấm Gửi câu trả lời)…"
                  disabled={busy}
                />
              </label>
              <div className="admin-span-2 inquiry-detail-actions">
                <button type="submit" className="admin-secondary" disabled={busy}>
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
                <button
                  type="button"
                  className="dash-primary"
                  disabled={busy}
                  onClick={() => void onSendReply()}
                >
                  {sending ? "Đang gửi…" : "Gửi câu trả lời"}
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
