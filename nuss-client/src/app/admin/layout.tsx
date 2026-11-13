import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";
import "@/styles/admin.css";

export const metadata = {
  title: "Admin | Mai Phương Resort",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
