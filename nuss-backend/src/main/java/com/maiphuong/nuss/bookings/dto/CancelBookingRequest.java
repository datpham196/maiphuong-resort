package com.maiphuong.nuss.bookings.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelBookingRequest(
		@NotBlank String bookingReference,
		String locale
) {
}
