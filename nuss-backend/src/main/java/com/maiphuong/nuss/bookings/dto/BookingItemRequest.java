package com.maiphuong.nuss.bookings.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookingItemRequest(
		@NotBlank @Size(max = 255) String slug,
		@Min(1) int adults,
		@Min(0) int children
) {
}
