import { apiFetch } from "@/services/api";

export type VenueKind = "restaurant" | "bar";

export type RestaurantImage = {
  id: string;
  role: string;
  url: string;
  altText: string | null;
  displayOrder: number;
};

export type PublicMenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number | null;
  priceCurrency: string;
  priceLabel: string | null;
};

export type PublicMenuCategory = {
  id: string;
  code: string;
  name: string;
  items: PublicMenuItem[];
};

export type PublicRestaurant = {
  id: string;
  kind: VenueKind;
  slug: string;
  title: string;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  heroSubtitle: string | null;
  introEyebrow: string | null;
  introHeading: string | null;
  introBody: string | null;
  introBodySecondary: string | null;
  menuSectionEyebrow: string | null;
  menuSectionHeading: string | null;
  menuSectionLead: string | null;
  coverImageUrl: string | null;
  displayOrder: number;
  slides: RestaurantImage[];
  mainImage: RestaurantImage | null;
  signatureImage: RestaurantImage | null;
  menuImages: RestaurantImage[];
  menu: PublicMenuCategory[];
};

export function fetchPublicRestaurants(locale: string) {
  return apiFetch<PublicRestaurant[]>(`/api/restaurants?locale=${encodeURIComponent(locale)}`);
}

export function fetchPublicRestaurant(slug: string, locale: string) {
  return apiFetch<PublicRestaurant>(
    `/api/restaurants/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
  );
}

export async function fetchPublicVenueByKind(kind: VenueKind, locale: string) {
  const items = await fetchPublicRestaurants(locale);
  const match = items.find((item) => item.kind === kind) ?? null;
  if (!match) return null;
  return fetchPublicRestaurant(match.slug, locale);
}
