import type { PageDocument } from "@/components/page-builder/types";
import { apiFetch } from "@/services/api";
import { getAdminToken } from "@/services/admin-rooms";

export type AdminExperienceContent = {
  locale: string;
  slug: string | null;
  title: string | null;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  documentDraft: PageDocument;
  documentPublished: PageDocument | null;
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
  seoTitle?: string;
  seoDescription?: string;
  documentDraft?: PageDocument;
};

export function listAdminExperiences() {
  return apiFetch<AdminExperience[]>("/api/admin/experiences", { token: getAdminToken() });
}

export function getAdminExperience(id: string) {
  return apiFetch<AdminExperience>(`/api/admin/experiences/${id}`, { token: getAdminToken() });
}

export function createAdminExperience(payload: {
  group: string;
  layout?: string;
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

export function uploadExperienceMedia(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ url: string; storageKey: string }>(`/api/admin/experiences/${id}/media`, {
    method: "POST",
    token: getAdminToken(),
    formData,
  });
}

export function createExperiencePreviewToken(id: string, locale: string) {
  return apiFetch<{ token: string; expiresInSeconds: number }>(
    `/api/admin/experiences/${id}/preview-token?locale=${encodeURIComponent(locale)}`,
    {
      method: "POST",
      token: getAdminToken(),
    },
  );
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
