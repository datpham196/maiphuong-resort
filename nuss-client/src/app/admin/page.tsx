"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin-toast";
import {
  AdminRoomType,
  SyncRun,
  clearAdminToken,
  getAdminToken,
  listAdminRooms,
  listSyncRuns,
  syncRooms,
} from "@/services/admin-rooms";

export default function AdminDashboardPage() {
  const router = useRouter();
  const toast = useAdminToast();
  const [rooms, setRooms] = useState<AdminRoomType[]>([]);
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    try {
      const [roomData, runData] = await Promise.all([listAdminRooms(), listSyncRuns()]);
      setRooms(roomData);
      setRuns(runData);
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

  const stats = useMemo(() => {
    const active = rooms.filter((r) => r.active).length;
    const publishedVi = rooms.filter((r) => r.contents.some((c) => c.locale === "vi" && c.published)).length;
    const missing = rooms.filter((r) => r.contents.every((c) => c.cmsStatus === "Missing")).length;
    const draft = rooms.filter((r) =>
      r.contents.some((c) => c.cmsStatus === "Draft"),
    ).length;
    return { total: rooms.length, active, publishedVi, missing, draft };
  }, [rooms]);

  const latest = runs[0];

  async function onSync() {
    setSyncing(true);
    setError(null);
    try {
      await syncRooms();
      await load();
      toast.success("Đồng bộ OnePMS thành công");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      setError(message);
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h1>Resort Overview</h1>
          <p>Tình trạng hạng phòng đồng bộ từ OnePMS và nội dung CMS trên website.</p>
        </div>
        <button type="button" className="dash-primary" onClick={() => void onSync()} disabled={syncing}>
          {syncing ? "Đang đồng bộ…" : "Đồng bộ OnePMS"}
        </button>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="dash-stats">
        <article className="dash-stat">
          <p>Tổng hạng phòng</p>
          <strong>{stats.total}</strong>
          <span>Đã sync từ OnePMS</span>
        </article>
        <article className="dash-stat">
          <p>Đang active</p>
          <strong>{stats.active}</strong>
          <span>Còn bán trên PMS</span>
        </article>
        <article className="dash-stat">
          <p>Published (VI)</p>
          <strong>{stats.publishedVi}</strong>
          <span>Hiện trên website</span>
        </article>
        <article className="dash-stat">
          <p>Thiếu nội dung</p>
          <strong>{stats.missing + stats.draft}</strong>
          <span>
            {stats.missing} missing · {stats.draft} draft
          </span>
        </article>
      </section>

      <section className="dash-grid">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Hạng phòng gần đây</h2>
            <Link href="/admin/rooms">Xem tất cả</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>ID</th>
                <th>CMS VI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.slice(0, 6).map((room) => {
                const vi = room.contents.find((c) => c.locale === "vi");
                return (
                  <tr key={room.id}>
                    <td>{room.name}</td>
                    <td>
                      <code>{room.externalId}</code>
                    </td>
                    <td>
                      <span className={`dash-badge is-${(vi?.cmsStatus ?? "Missing").toLowerCase()}`}>
                        {vi?.cmsStatus ?? "Missing"}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/rooms/${room.id}`} className="admin-secondary">
                        Sửa
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rooms.length === 0 ? <p className="admin-muted">Chưa có dữ liệu. Bấm đồng bộ OnePMS.</p> : null}
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <h2>Hoạt động sync</h2>
          </div>
          {latest ? (
            <ul className="dash-activity">
              <li>
                <strong>{latest.status}</strong>
                <span>
                  {latest.totalFetched} fetched · {latest.totalCreated} created · {latest.totalUpdated} updated
                </span>
              </li>
              <li>
                <strong>Deactivated</strong>
                <span>{latest.totalDeactivated} hạng không còn trên snapshot</span>
              </li>
              {latest.errorMessage ? (
                <li>
                  <strong>Lỗi</strong>
                  <span className="admin-error">{latest.errorMessage}</span>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="admin-muted">Chưa có lần sync nào.</p>
          )}
          <Link className="dash-link" href="/admin/rooms">
            Quản lý hạng phòng →
          </Link>
        </article>
      </section>
    </div>
  );
}
