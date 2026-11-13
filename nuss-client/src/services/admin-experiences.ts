import { apiFetch } from "@/services/api";
import { getAdminToken } from "@/services/admin-rooms";

export type AdminExperienceContent = {
  locale: string;
  slug: string | null;
  title: string | null;
  shortDescription: string | null;
  description: string | null;
  itinerary: string | null;
  durationText: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  priceNote: string | null;
  conditions: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
  cmsStatus: string;
};

export type AdminExperience = {
  id: string;
  group: string;
  layout: string;
  displayOrder: number;
  active: boolean;
  contents: AdminExperienceContent[];
  images: {
    id: string;
    url: string;
    altText: string | null;
    displayOrder: number;
    cover: boolean;
  }[];
};

export type ExperienceContentPayload = {
  slug?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  itinerary?: string;
  durationText?: string;
  priceAmount?: number | null;
  priceCurrency?: string;
  priceNote?: string;
  conditions?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export function listAdminExperiences() {
  return apiFetch<AdminExperience[]>("/api/admin/experiences", { token: getAdminToken() });
}

export function getAdminExperience(id: string) {
  return apiFetch<AdminExperience>(`/api/admin/experiences/${id}`, { token: getAdminToken() });
}

export function createAdminExperience(payload: {
  group: string;
  layout: string;
  displayOrder?: number;
  locale?: string;
  content?: ExperienceContentPayload;
}) {
  return apiFetch<AdminExperience>("/api/admin/experiences", {
    method: "POST",
    token: getAdminToken(),
    body: payload,
  });
}

export function updateAdminExperience(
  id: string,
  payload: { group?: string; layout?: string; displayOrder?: number; active?: boolean },
) {
  return apiFetch<AdminExperience>(`/api/admin/experiences/${id}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function deactivateAdminExperience(id: string) {
  return apiFetch<void>(`/api/admin/experiences/${id}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}

export function saveExperienceContent(id: string, locale: string, payload: ExperienceContentPayload) {
  return apiFetch<AdminExperience>(`/api/admin/experiences/${id}/contents/${locale}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function publishExperienceContent(id: string, locale: string) {
  return apiFetch<AdminExperience>(`/api/admin/experiences/${id}/contents/${locale}/publish`, {
    method: "POST",
    token: getAdminToken(),
  });
}

export function unpublishExperienceContent(id: string, locale: string) {
  return apiFetch<AdminExperience>(`/api/admin/experiences/${id}/contents/${locale}/unpublish`, {
    method: "POST",
    token: getAdminToken(),
  });
}

export function uploadExperienceImage(id: string, file: File, altText?: string, asCover = false) {
  const formData = new FormData();
  formData.append("file", file);
  const params = new URLSearchParams();
  if (altText) params.set("altText", altText);
  if (asCover) params.set("asCover", "true");
  const query = params.toString();
  return apiFetch<{ id: string; url: string; altText: string | null; displayOrder: number; cover: boolean }>(
    `/api/admin/experiences/${id}/images${query ? `?${query}` : ""}`,
    {
      method: "POST",
      token: getAdminToken(),
      formData,
    },
  );
}

export function deleteExperienceImage(id: string, imageId: string) {
  return apiFetch<void>(`/api/admin/experiences/${id}/images/${imageId}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}
