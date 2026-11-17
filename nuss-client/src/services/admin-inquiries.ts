import { apiFetch } from "@/services/api";
import { getAdminToken } from "@/services/admin-rooms";

export type AdminInquiry = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  question: string;
  status: string;
  staffAnswer: string | null;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateInquiryPayload = {
  status?: string;
  staffAnswer?: string | null;
  sendToGuest?: boolean;
};

export function listAdminInquiries(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminInquiry[]>(`/api/admin/inquiries${query}`, {
    token: getAdminToken(),
  });
}

export function getAdminInquiry(id: string) {
  return apiFetch<AdminInquiry>(`/api/admin/inquiries/${id}`, {
    token: getAdminToken(),
  });
}

export function updateAdminInquiry(id: string, payload: UpdateInquiryPayload) {
  return apiFetch<AdminInquiry>(`/api/admin/inquiries/${id}`, {
    method: "PATCH",
    token: getAdminToken(),
    body: payload,
  });
}
