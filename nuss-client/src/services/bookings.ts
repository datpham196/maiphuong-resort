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

export type BookingLookupRoom = {
  roomTypeId: string | null;
  roomTitle: string | null;
  roomNumber: string | null;
  adult: number | null;
  child: number | null;
  breakfast: boolean | null;
  lunch: boolean | null;
  dinner: boolean | null;
  rates: number[];
};

export type BookingLookupService = {
  serviceId: string | null;
  serviceName: string | null;
  serviceType: string | null;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
};

export type BookingLookupPayment = {
  paymentDate: string | null;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
  amount: number | null;
  paymentStatus: string | null;
  transactionId: string | null;
};

export type BookingLookupResponse = {
  bookingId: string | null;
  bookingReference: string | null;
  bookingIds: string[];
  cancellable: boolean;
  name: string | null;
  email: string | null;
  phone: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  bookingStatus: string | null;
  idNumber: string | null;
  idType: string | null;
  address: string | null;
  totalAmount: number | null;
  totalPaid: number | null;
  totalRemaining: number | null;
  paymentStatus: string | null;
  currency: string | null;
  rooms: BookingLookupRoom[];
  services: BookingLookupService[];
  payments: BookingLookupPayment[];
  created: string | null;
  updated: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
};

export function lookupBooking(ref: string, locale?: string) {
  const params = new URLSearchParams({ ref: ref.trim() });
  if (locale) {
    params.set("locale", locale);
  }
  return apiFetch<BookingLookupResponse>(`/api/bookings/lookup?${params.toString()}`);
}

export function cancelBooking(bookingReference: string, locale?: string) {
  return apiFetch<BookingLookupResponse>("/api/bookings/cancel", {
    method: "POST",
    body: {
      bookingReference: bookingReference.trim(),
      locale,
    },
  });
}
