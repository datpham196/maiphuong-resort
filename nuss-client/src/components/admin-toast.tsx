"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

type AdminToastContextValue = {
  pushToast: (tone: ToastTone, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

let toastSeq = 0;

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const pushToast = useCallback((tone: ToastTone, message: string) => {
    const id = ++toastSeq;
    setItems((prev) => [...prev, { id, tone, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const value = useMemo<AdminToastContextValue>(
    () => ({
      pushToast,
      success: (message) => pushToast("success", message),
      error: (message) => pushToast("error", message),
    }),
    [pushToast],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack" aria-live="polite" aria-relevant="additions">
        {items.map((item) => (
          <div key={item.id} className={`admin-toast is-${item.tone}`} role="status">
            {item.message}
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return ctx;
}
