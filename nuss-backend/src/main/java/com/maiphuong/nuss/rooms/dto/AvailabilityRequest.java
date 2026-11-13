package com.maiphuong.nuss.rooms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityRequest(
		@NotNull LocalDate arrivalDate,
		@NotNull LocalDate departureDate,
		List<String> roomTypeIds,
		String slug,
		String locale,
		@Min(1) Integer adults,
		@Min(0) Integer children
) {
}
