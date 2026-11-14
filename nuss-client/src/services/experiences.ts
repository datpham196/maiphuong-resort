import type { PageDocument } from "@/components/page-builder/types";
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
  layout: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
  document: PageDocument;
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

export function fetchExperiencePreview(token: string) {
  return apiFetch<PublicExperience>(`/api/experiences/preview?token=${encodeURIComponent(token)}`);
}
