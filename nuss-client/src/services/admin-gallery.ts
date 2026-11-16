import { apiFetch } from "@/services/api";
import { getAdminToken } from "@/services/admin-rooms";

export type AdminGalleryImage = {
  id: string;
  url: string;
  captionVi: string | null;
  captionEn: string | null;
  caption: string | null;
  displayOrder: number;
  active: boolean;
};

export function listAdminGallery() {
  return apiFetch<AdminGalleryImage[]>("/api/admin/gallery", { token: getAdminToken() });
}

export function uploadGalleryImage(
  file: File,
  options: { captionVi?: string; captionEn?: string } = {},
) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.captionVi) formData.append("captionVi", options.captionVi);
  if (options.captionEn) formData.append("captionEn", options.captionEn);
  return apiFetch<AdminGalleryImage>("/api/admin/gallery", {
    method: "POST",
    token: getAdminToken(),
    formData,
  });
}

export function updateGalleryImage(
  id: string,
  payload: {
    captionVi?: string | null;
    captionEn?: string | null;
    displayOrder?: number;
    active?: boolean;
  },
) {
  return apiFetch<AdminGalleryImage>(`/api/admin/gallery/${encodeURIComponent(id)}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function reorderGalleryImages(ids: string[]) {
  return apiFetch<AdminGalleryImage[]>("/api/admin/gallery/reorder", {
    method: "PUT",
    token: getAdminToken(),
    body: { ids },
  });
}

export function deleteGalleryImage(id: string) {
  return apiFetch<void>(`/api/admin/gallery/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}
