"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AdminToastProvider } from "@/components/admin-toast";
import { clearAdminToken } from "@/services/admin-rooms";

type Props = {
  children: ReactNode;
};

const navGroups = [
  {
    label: "Tổng quan",
    items: [{ href: "/admin", label: "Dashboard", match: (path: string) => path === "/admin" }],
  },
  {
    label: "Nội dung",
    items: [
      {
        href: "/admin/rooms",
        label: "Hạng phòng",
        match: (path: string) => path === "/admin/rooms" || path.startsWith("/admin/rooms/"),
      },
      {
        href: "/admin/experiences",
        label: "Điểm đến / tour / vé",
        match: (path: string) => path === "/admin/experiences" || path.startsWith("/admin/experiences/"),
      },
      {
        href: "/admin/restaurants",
        label: "Nhà hàng",
        match: (path: string) => path === "/admin/restaurants" || path.startsWith("/admin/restaurants/"),
      },
    ],
  },
];

export function AdminShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <AdminToastProvider>{children}</AdminToastProvider>;
  }

  return (
    <AdminToastProvider>
      <div className="admin-app">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="admin-brand-mark" aria-hidden="true" />
            <div>
              <strong>Mai Phương</strong>
              <span>Resort Admin</span>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin">
            {navGroups.map((group) => (
              <div key={group.label} className="admin-nav-group">
                <p>{group.label}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={item.match(pathname) ? "is-active" : undefined}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-foot">
            <div className="admin-user">
              <span className="admin-avatar" aria-hidden="true">
                MP
              </span>
              <div>
                <strong>Staff</strong>
                <span>Quản trị nội dung</span>
              </div>
            </div>
            <button
              type="button"
              className="admin-logout"
              aria-label="Đăng xuất"
              onClick={() => {
                clearAdminToken();
                router.replace("/admin/login");
              }}
            >
              Thoát
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-search" aria-hidden="true">
              <span>Tìm nhanh nội dung phòng…</span>
            </div>
            <div className="admin-topbar-actions">
              <span className="admin-chip">OnePMS</span>
              <span className="admin-avatar is-small" aria-hidden="true">
                MP
              </span>
            </div>
          </header>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </AdminToastProvider>
  );
}
