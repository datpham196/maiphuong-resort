import { apiFetch } from "@/services/api";
import { getAdminToken } from "@/services/admin-rooms";

export type VenueKind = "restaurant" | "bar";

export type AdminRestaurantImage = {
  id: string;
  role: "slide" | "main" | "signature" | "menu" | string;
  url: string;
  altText: string | null;
  displayOrder: number;
};

export type AdminRestaurantContent = {
  locale: string;
  slug: string | null;
  title: string | null;
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
  published: boolean;
  cmsStatus: string;
};

export type AdminRestaurant = {
  id: string;
  kind: VenueKind;
  displayOrder: number;
  active: boolean;
  coverImageUrl: string | null;
  contents: AdminRestaurantContent[];
  images: AdminRestaurantImage[];
};

export type RestaurantContentPayload = {
  slug?: string;
  title?: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  heroSubtitle?: string;
  introEyebrow?: string;
  introHeading?: string;
  introBody?: string;
  introBodySecondary?: string;
  menuSectionEyebrow?: string;
  menuSectionHeading?: string;
  menuSectionLead?: string;
};

export type MenuCategory = {
  id: string;
  code: string;
  displayOrder: number;
  active: boolean;
  names: { locale: string; name: string }[];
};

export type MenuItem = {
  id: string;
  categoryId: string;
  categoryCode: string;
  priceAmount: number | null;
  priceCurrency: string;
  priceLabel: string | null;
  displayOrder: number;
  active: boolean;
  contents: { locale: string; name: string; description: string | null }[];
};

export type MenuItemPayload = {
  categoryId?: string;
  priceAmount?: number | null;
  priceCurrency?: string;
  priceLabel?: string | null;
  displayOrder?: number;
  active?: boolean;
  nameVi?: string;
  descriptionVi?: string;
  nameEn?: string;
  descriptionEn?: string;
};

export function getPrimaryAdminRestaurant(kind: VenueKind = "restaurant") {
  return apiFetch<AdminRestaurant>(
    `/api/admin/restaurants/primary?kind=${encodeURIComponent(kind)}`,
    { token: getAdminToken() },
  );
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

export function uploadRestaurantImage(id: string, role: string, file: File, altText?: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("role", role);
  if (altText) formData.append("altText", altText);
  return apiFetch<AdminRestaurantImage>(`/api/admin/restaurants/${id}/images`, {
    method: "POST",
    token: getAdminToken(),
    formData,
  });
}

export function deleteRestaurantImage(id: string, imageId: string) {
  return apiFetch<void>(`/api/admin/restaurants/${id}/images/${imageId}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}

export function listMenuCategories(id: string) {
  return apiFetch<MenuCategory[]>(`/api/admin/restaurants/${id}/menu/categories`, {
    token: getAdminToken(),
  });
}

export function listMenuItems(id: string) {
  return apiFetch<MenuItem[]>(`/api/admin/restaurants/${id}/menu/items`, {
    token: getAdminToken(),
  });
}

export function createMenuItem(id: string, payload: MenuItemPayload) {
  return apiFetch<MenuItem>(`/api/admin/restaurants/${id}/menu/items`, {
    method: "POST",
    token: getAdminToken(),
    body: payload,
  });
}

export function updateMenuItem(id: string, itemId: string, payload: MenuItemPayload) {
  return apiFetch<MenuItem>(`/api/admin/restaurants/${id}/menu/items/${itemId}`, {
    method: "PUT",
    token: getAdminToken(),
    body: payload,
  });
}

export function deleteMenuItem(id: string, itemId: string) {
  return apiFetch<void>(`/api/admin/restaurants/${id}/menu/items/${itemId}`, {
    method: "DELETE",
    token: getAdminToken(),
  });
}
