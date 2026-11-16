import { apiFetch } from "@/services/api";

export type PublicGalleryImage = {
  id: string;
  url: string;
  captionVi: string | null;
  captionEn: string | null;
  caption: string | null;
  displayOrder: number;
  active: boolean;
};

export function fetchPublicGallery(locale: string) {
  return apiFetch<PublicGalleryImage[]>(`/api/gallery?locale=${encodeURIComponent(locale)}`);
}
