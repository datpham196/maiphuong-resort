import { apiFetch } from "@/services/api";

export type ExperienceImage = {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  cover: boolean;
};

export type PublicExperience = {
  id: string;
  group: "destination" | "tour" | "ticket" | string;
  layout: "layout1" | "layout2" | "layout3" | string;
  slug: string;
  title: string;
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
  displayOrder: number;
  coverImage: ExperienceImage | null;
  images: ExperienceImage[];
};

export function fetchPublicExperiences(locale: string, group?: string) {
  const params = new URLSearchParams({ locale });
  if (group) {
    params.set("group", group);
  }
  return apiFetch<PublicExperience[]>(`/api/experiences?${params.toString()}`);
}

export function fetchPublicExperience(slug: string, locale: string) {
  return apiFetch<PublicExperience>(
    `/api/experiences/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
  );
}
