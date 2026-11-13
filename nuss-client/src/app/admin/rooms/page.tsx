"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function AdminRoomsPage() {
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
          <h1>Hạng phòng</h1>
          <p>Catalog đồng bộ từ OnePMS. Bổ sung ảnh và mô tả trước khi publish.</p>
        </div>
        <button type="button" className="dash-primary" onClick={() => void onSync()} disabled={syncing}>
          {syncing ? "Đang đồng bộ…" : "Đồng bộ OnePMS"}
        </button>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {runs[0] ? (
        <section className="dash-panel" style={{ marginBottom: "1rem" }}>
          <p className="admin-muted" style={{ margin: 0 }}>
            Sync gần nhất: <strong>{runs[0].status}</strong> · fetched {runs[0].totalFetched} · created{" "}
            {runs[0].totalCreated} · updated {runs[0].totalUpdated} · deactivated {runs[0].totalDeactivated}
          </p>
          {runs[0].errorMessage ? <p className="admin-error">{runs[0].errorMessage}</p> : null}
        </section>
      ) : null}

      <section className="dash-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên OnePMS</th>
              <th>roomTypeID</th>
              <th>Sức chứa</th>
              <th>Giá</th>
              <th>Active</th>
              <th>CMS vi</th>
              <th>CMS en</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const vi = room.contents.find((c) => c.locale === "vi");
              const en = room.contents.find((c) => c.locale === "en");
              return (
                <tr key={room.id}>
                  <td>{room.name}</td>
                  <td>
                    <code>{room.externalId}</code>
                  </td>
                  <td>{room.maxOccupancy ?? "—"}</td>
                  <td>{room.rackRate != null ? room.rackRate.toLocaleString("vi-VN") : "—"}</td>
                  <td>{room.active ? "Yes" : "No"}</td>
                  <td>
                    <span className={`dash-badge is-${(vi?.cmsStatus ?? "Missing").toLowerCase()}`}>
                      {vi?.cmsStatus ?? "Missing"}
                    </span>
                  </td>
                  <td>
                    <span className={`dash-badge is-${(en?.cmsStatus ?? "Missing").toLowerCase()}`}>
                      {en?.cmsStatus ?? "Missing"}
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
        {rooms.length === 0 ? <p className="admin-muted">Chưa có hạng phòng. Bấm đồng bộ từ OnePMS.</p> : null}
      </section>
    </div>
  );
}
