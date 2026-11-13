package com.maiphuong.nuss.bookings.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateBookingResponse(
		String requestCode,
		String mode,
		String status,
		String bookingReference,
		String roomSlug,
		String roomTitle,
		LocalDate arrivalDate,
		LocalDate departureDate,
		int adults,
		int children,
		int roomCount,
		List<Item> items,
		BigDecimal totalAmount,
		String currency
) {
	public record Item(
			String slug,
			String title,
			int adults,
			int children,
			int roomCount,
			List<RoomAllocation> allocation,
			BigDecimal lineTotal
	) {
	}

	public record RoomAllocation(int adults, int children) {
	}
}
