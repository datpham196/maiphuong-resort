import { apiFetch } from "@/services/api";

export type AdminContent = {
  locale: string;
  slug: string | null;
  title: string | null;
  shortDescription: string | null;
  description: string | null;
  amenities: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
  published: boolean;
  cmsStatus: string;
};

export type AdminRoomType = {
  id: string;
  externalId: string;
  name: string;
  maxOccupancy: number | null;
  rackRate: number | null;
  inventoryCount: number | null;
  active: boolean;
  lastSeenAt: string | null;
  contents: AdminContent[];
  images: {
    id: string;
    url: string;
    altText: string | null;
    displayOrder: number;
    cover: boolean;
  }[];
};

export type SyncRun = {
  id: string;
  trigger: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  totalFetched: number;
  totalCreated: number;
  totalUpdated: number;
  totalDeactivated: number;
  errorMessage: string | null;
};

export type ContentPayload = {
  slug?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  amenities?: string[];
  seoTitle?: string;
  seoDescription?: string;
  displayOrder?: number;
};

const TOKEN_KEY = "nuss_admin_token";

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function adminLogin(username: string, password: string) {
  return apiFetch<{ accessToken: string; username: string; role: string }>("/api/admin/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function listAdminRooms() {
  return apiFetch<AdminRoomType[]>("/api/admin/room-types", { token: getAdminToken() });
}

export function getAdminRoom(id: string) {
  return apiFetch<AdminRoomType>(`/api/admin/room-types/${id}`, { token: getAdminToken() });
}

export function syncRooms() {
  return apiFetch<SyncRun>("/api/admin/room-types/sync", {
    method: "POST",
    token: getAdminToken(),
  });
}

export function listSyncRuns() {
  return apiFetch<SyncRun[]>("/api/admin/room-sync-runs", { token: getAdminToken() });
}

export function saveContent(id: string, locale: string, payload: ContentPayload) {
  return apiFetch<AdminRoomType>(`/api/admin/room-types/${id}/contents/${locale}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function publishContent(id: string, locale: string) {
  return apiFetch<AdminRoomType>(`/api/admin/room-types/${id}/contents/${locale}/publish`, {
    method: "POST",
    token: getAdminToken(),
  });
}

export function unpublishContent(id: string, locale: string) {
  return apiFetch<AdminRoomType>(`/api/admin/room-types/${id}/contents/${locale}/unpublish`, {
    method: "POST",
    token: getAdminToken(),
  });
}

export function uploadRoomImage(
  id: string,
  file: File,
  options: { altText?: string; asCover?: boolean } = {},
) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.altText) formData.append("altText", options.altText);
  const params = new URLSearchParams();
  if (options.altText) params.set("altText", options.altText);
  params.set("asCover", options.asCover ? "true" : "false");
  const query = `?${params}`;
  return apiFetch(`/api/admin/room-types/${id}/images${query}`, {
    method: "POST",
    token: getAdminToken(),
    formData,
  });
}

export function setCoverImage(id: string, imageId: string) {
  return apiFetch(`/api/admin/room-types/${id}/images/${imageId}/cover`, {
    method: "PUT",
    token: getAdminToken(),
  });
}

export function deleteRoomImage(id: string, imageId: string) {
  return apiFetch<void>(`/api/admin/room-types/${id}/images/${imageId}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}
