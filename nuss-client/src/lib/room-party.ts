/** Mirrors backend RoomPartyAllocator for live cart quotes. */

export const MAX_SELF_SERVE_ROOMS = 4;

/** Soft UI caps for party steppers — not an OnePMS API constraint. */
export const MAX_PARTY_ADULTS = 20;
export const MAX_PARTY_CHILDREN = 20;

export type RoomShare = {
  adults: number;
  children: number;
};

export type PartyPlan = {
  roomsNeeded: number;
  canAllocate: boolean;
  blockReason: string | null;
  rooms: RoomShare[];
};

export function planParty(
  adults: number,
  children: number,
  maxOccupancy: number | null | undefined,
): PartyPlan {
  if (adults < 1) {
    return { roomsNeeded: 0, canAllocate: false, blockReason: "ADULTS_REQUIRED", rooms: [] };
  }

  const guestChildren = Math.max(0, children);
  const guests = adults + guestChildren;
  const capacity = maxOccupancy == null || maxOccupancy < 1 ? guests : maxOccupancy;
  const roomsNeeded = Math.max(1, Math.ceil(guests / capacity));

  if (roomsNeeded > MAX_SELF_SERVE_ROOMS) {
    return { roomsNeeded, canAllocate: false, blockReason: "TOO_MANY_ROOMS", rooms: [] };
  }
  if (adults < roomsNeeded) {
    return { roomsNeeded, canAllocate: false, blockReason: "NOT_ENOUGH_ADULTS", rooms: [] };
  }

  const roomAdults = Array.from({ length: roomsNeeded }, () => 1);
  const roomChildren = Array.from({ length: roomsNeeded }, () => 0);
  let remainingAdults = adults - roomsNeeded;
  let remainingChildren = guestChildren;

  let index = 0;
  while (remainingAdults > 0) {
    if (roomAdults[index] + roomChildren[index] < capacity) {
      roomAdults[index] += 1;
      remainingAdults -= 1;
    }
    index = (index + 1) % roomsNeeded;
  }

  index = 0;
  let guard = 0;
  while (remainingChildren > 0 && guard < roomsNeeded * capacity) {
    if (roomAdults[index] + roomChildren[index] < capacity) {
      roomChildren[index] += 1;
      remainingChildren -= 1;
    }
    index = (index + 1) % roomsNeeded;
    guard += 1;
  }

  if (remainingChildren > 0) {
    return { roomsNeeded, canAllocate: false, blockReason: "OCCUPANCY_EXCEEDED", rooms: [] };
  }

  return {
    roomsNeeded,
    canAllocate: true,
    blockReason: null,
    rooms: roomAdults.map((a, i) => ({ adults: a, children: roomChildren[i] })),
  };
}
