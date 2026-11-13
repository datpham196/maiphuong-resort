import { apiFetch } from "@/services/api";

export type RoomImage = {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  cover: boolean;
};

export type PublicRoom = {
  id: string;
  slug: string;
  externalId: string;
  pmsName: string;
  maxOccupancy: number | null;
  rackRate: number | null;
  currency: string;
  content: {
    locale: string;
    title: string;
    shortDescription: string | null;
    description: string | null;
    amenities: string[];
    seoTitle: string | null;
    seoDescription: string | null;
  };
  coverImage: RoomImage | null;
  images: RoomImage[];
};

export function fetchPublicRooms(locale: string) {
  return apiFetch<PublicRoom[]>(`/api/rooms?locale=${encodeURIComponent(locale)}`);
}

export function fetchPublicRoom(slug: string, locale: string) {
  return apiFetch<PublicRoom>(`/api/rooms/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`);
}
