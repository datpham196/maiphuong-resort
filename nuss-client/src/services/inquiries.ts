import { apiFetch } from "@/services/api";

export type CreateInquiryPayload = {
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  question: string;
};

export type CreateInquiryResponse = {
  id: string;
  status: string;
  message: string;
};

export function createInquiry(payload: CreateInquiryPayload) {
  return apiFetch<CreateInquiryResponse>("/api/inquiries", {
    method: "POST",
    body: {
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone || null,
      question: payload.question,
    },
  });
}
