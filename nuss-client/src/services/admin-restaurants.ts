import type { PageDocument } from "@/components/page-builder/types";
import { apiFetch } from "@/services/api";
import { getAdminToken } from "@/services/admin-rooms";

export type AdminRestaurantContent = {
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

export type VenueKind = "restaurant" | "bar";

export type AdminRestaurant = {
  id: string;
  kind: VenueKind;
  displayOrder: number;
  active: boolean;
  coverImageUrl: string | null;
  contents: AdminRestaurantContent[];
};

export type RestaurantContentPayload = {
  slug?: string;
  title?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  documentDraft?: PageDocument;
};

export function listAdminRestaurants() {
  return apiFetch<AdminRestaurant[]>("/api/admin/restaurants", { token: getAdminToken() });
}

export function getPrimaryAdminRestaurant(kind: VenueKind = "restaurant") {
  return apiFetch<AdminRestaurant>(
    `/api/admin/restaurants/primary?kind=${encodeURIComponent(kind)}`,
    { token: getAdminToken() },
  );
}

export function getAdminRestaurant(id: string) {
  return apiFetch<AdminRestaurant>(`/api/admin/restaurants/${id}`, { token: getAdminToken() });
}

export function createAdminRestaurant(payload: {
  displayOrder?: number;
  locale?: string;
  kind?: VenueKind;
  content?: RestaurantContentPayload;
}) {
  return apiFetch<AdminRestaurant>("/api/admin/restaurants", {
    method: "POST",
    token: getAdminToken(),
    body: payload,
  });
}

export function updateAdminRestaurant(
  id: string,
  payload: { displayOrder?: number; active?: boolean; coverImageUrl?: string | null },
) {
  return apiFetch<AdminRestaurant>(`/api/admin/restaurants/${id}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function deactivateAdminRestaurant(id: string) {
  return apiFetch<void>(`/api/admin/restaurants/${id}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}

export function saveRestaurantContent(id: string, locale: string, payload: RestaurantContentPayload) {
  return apiFetch<AdminRestaurant>(`/api/admin/restaurants/${id}/contents/${locale}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function publishRestaurantContent(id: string, locale: string) {
  return apiFetch<AdminRestaurant>(`/api/admin/restaurants/${id}/contents/${locale}/publish`, {
    method: "POST",
    token: getAdminToken(),
  });
}

export function unpublishRestaurantContent(id: string, locale: string) {
  return apiFetch<AdminRestaurant>(`/api/admin/restaurants/${id}/contents/${locale}/unpublish`, {
    method: "POST",
    token: getAdminToken(),
  });
}

export function uploadRestaurantMedia(id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ url: string; storageKey: string }>(`/api/admin/restaurants/${id}/media`, {
    method: "POST",
    token: getAdminToken(),
    formData,
  });
}

export function createRestaurantPreviewToken(id: string, locale: string) {
  return apiFetch<{ token: string; expiresInSeconds: number }>(
    `/api/admin/restaurants/${id}/preview-token?locale=${encodeURIComponent(locale)}`,
    {
      method: "POST",
      token: getAdminToken(),
    },
  );
}
