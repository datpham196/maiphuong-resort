import { apiFetch } from "@/services/api";
import type { PageDocument } from "@/components/page-builder/types";

export type PublicRestaurant = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  coverImageUrl: string | null;
  displayOrder: number;
  document: PageDocument;
};

export function fetchPublicRestaurants(locale: string) {
  return apiFetch<PublicRestaurant[]>(`/api/restaurants?locale=${encodeURIComponent(locale)}`);
}

export function fetchPublicRestaurant(slug: string, locale: string) {
  return apiFetch<PublicRestaurant>(
    `/api/restaurants/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
  );
}

export function fetchRestaurantPreview(token: string) {
  return apiFetch<PublicRestaurant>(`/api/restaurants/preview?token=${encodeURIComponent(token)}`);
}
