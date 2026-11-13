import { apiFetch } from "@/services/api";

export type AvailabilityDailyRate = {
  date: string;
  rate: number;
};

export type RoomAllocation = {
  adults: number;
  children: number;
};

export type AvailabilityItem = {
  roomTypeId: string;
  externalId: string;
  slug: string;
  title: string;
  maxOccupancy: number | null;
  availableAmount: number;
  available: boolean;
  nightlyTotal: number;
  roomsNeeded: number;
  partyFits: boolean;
  partyBlockReason: string | null;
  partyTotalAmount: number;
  currency: string;
  allocation: RoomAllocation[];
  dailyRates: AvailabilityDailyRate[];
};

export type AvailabilityResponse = {
  arrivalDate: string;
  departureDate: string;
  adults: number | null;
  children: number | null;
  items: AvailabilityItem[];
};

export type BookingItemPayload = {
  slug: string;
  adults: number;
  children: number;
};

export type CreateBookingPayload = {
  arrivalDate: string;
  departureDate: string;
  partyAdults: number;
  partyChildren: number;
  items: BookingItemPayload[];
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  notes?: string | null;
  locale?: string;
};

export type CreateBookingItemResponse = {
  slug: string;
  title: string;
  adults: number;
  children: number;
  roomCount: number;
  allocation: RoomAllocation[];
  lineTotal: number;
};

export type CreateBookingResponse = {
  requestCode: string;
  mode: string;
  status: string;
  bookingReference: string | null;
  roomSlug: string;
  roomTitle: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
  roomCount: number;
  items: CreateBookingItemResponse[];
  totalAmount: number | null;
  currency: string;
};

export function checkRoomAvailability(body: {
  arrivalDate: string;
  departureDate: string;
  slug?: string;
  roomTypeIds?: string[];
  locale?: string;
  adults?: number;
  children?: number;
}) {
  return apiFetch<AvailabilityResponse>("/api/rooms/availability", {
    method: "POST",
    body,
  });
}

export function createBooking(body: CreateBookingPayload) {
  return apiFetch<CreateBookingResponse>("/api/bookings", {
    method: "POST",
    body,
  });
}
