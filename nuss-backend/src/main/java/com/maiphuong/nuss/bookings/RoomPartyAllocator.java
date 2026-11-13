package com.maiphuong.nuss.bookings;

import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

/**
 * Splits a guest party across N rooms of the same type.
 * Each room gets at least one adult when possible; roomsNeeded is based on max occupancy.
 */
public final class RoomPartyAllocator {

	public static final int MAX_SELF_SERVE_ROOMS = 4;

	private RoomPartyAllocator() {
	}

	public record RoomShare(int adults, int children) {
	}

	public record PartyPlan(
			int roomsNeeded,
			boolean canAllocate,
			String blockReason,
			List<RoomShare> rooms
	) {
	}

	public static PartyPlan plan(int adults, int children, Integer maxOccupancy) {
		if (adults < 1) {
			return new PartyPlan(0, false, "ADULTS_REQUIRED", List.of());
		}
		int guests = adults + Math.max(0, children);
		int capacity = maxOccupancy == null || maxOccupancy < 1 ? guests : maxOccupancy;
		int roomsNeeded = Math.max(1, (int) Math.ceil(guests / (double) capacity));

		if (roomsNeeded > MAX_SELF_SERVE_ROOMS) {
			return new PartyPlan(roomsNeeded, false, "TOO_MANY_ROOMS", List.of());
		}
		// OnePMS room rows need adults; cannot open more rooms than adults available.
		if (adults < roomsNeeded) {
			return new PartyPlan(roomsNeeded, false, "NOT_ENOUGH_ADULTS", List.of());
		}

		List<RoomShare> rooms = allocate(adults, Math.max(0, children), roomsNeeded, capacity);
		return new PartyPlan(roomsNeeded, true, null, rooms);
	}

	public static List<RoomShare> requirePlan(int adults, int children, Integer maxOccupancy) {
		PartyPlan plan = plan(adults, children, maxOccupancy);
		if (!plan.canAllocate()) {
			String code = plan.blockReason() == null ? "OCCUPANCY_EXCEEDED" : plan.blockReason();
			throw new ApiException(
					HttpStatus.BAD_REQUEST,
					code,
					"Cannot allocate " + (adults + children) + " guests across rooms for this room type"
			);
		}
		return plan.rooms();
	}

	private static List<RoomShare> allocate(int adults, int children, int roomsNeeded, int maxOccupancy) {
		int[] roomAdults = new int[roomsNeeded];
		int[] roomChildren = new int[roomsNeeded];

		// Seed one adult per room.
		int remainingAdults = adults - roomsNeeded;
		for (int i = 0; i < roomsNeeded; i++) {
			roomAdults[i] = 1;
		}

		// Spread remaining adults, then children, without exceeding max occupancy.
		int remainingChildren = children;
		int index = 0;
		while (remainingAdults > 0) {
			if (roomAdults[index] + roomChildren[index] < maxOccupancy) {
				roomAdults[index]++;
				remainingAdults--;
			}
			index = (index + 1) % roomsNeeded;
		}
		index = 0;
		int guard = 0;
		while (remainingChildren > 0 && guard < roomsNeeded * maxOccupancy) {
			if (roomAdults[index] + roomChildren[index] < maxOccupancy) {
				roomChildren[index]++;
				remainingChildren--;
			}
			index = (index + 1) % roomsNeeded;
			guard++;
		}
		if (remainingChildren > 0) {
			throw new ApiException(
					HttpStatus.BAD_REQUEST,
					"OCCUPANCY_EXCEEDED",
					"Could not fit all guests into the required rooms"
			);
		}

		List<RoomShare> shares = new ArrayList<>(roomsNeeded);
		for (int i = 0; i < roomsNeeded; i++) {
			shares.add(new RoomShare(roomAdults[i], roomChildren[i]));
		}
		return shares;
	}
}
