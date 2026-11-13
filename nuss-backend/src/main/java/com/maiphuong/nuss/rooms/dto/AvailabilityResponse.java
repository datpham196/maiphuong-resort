package com.maiphuong.nuss.rooms.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(
		LocalDate arrivalDate,
		LocalDate departureDate,
		Integer adults,
		Integer children,
		List<Item> items
) {
	public record Item(
			String roomTypeId,
			String externalId,
			String slug,
			String title,
			Integer maxOccupancy,
			int availableAmount,
			boolean available,
			BigDecimal nightlyTotal,
			int roomsNeeded,
			boolean partyFits,
			String partyBlockReason,
			BigDecimal partyTotalAmount,
			String currency,
			List<RoomAllocation> allocation,
			List<DailyRate> dailyRates
	) {
	}

	public record RoomAllocation(int adults, int children) {
	}

	public record DailyRate(LocalDate date, BigDecimal rate) {
	}
}
