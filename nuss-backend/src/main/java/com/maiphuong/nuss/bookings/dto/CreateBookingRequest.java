package com.maiphuong.nuss.bookings.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateBookingRequest(
		@NotNull LocalDate arrivalDate,
		@NotNull LocalDate departureDate,
		@Min(1) int partyAdults,
		@Min(0) int partyChildren,
		@NotEmpty @Valid List<BookingItemRequest> items,
		@NotBlank @Size(max = 255) String guestName,
		@NotBlank @Size(max = 50) String guestPhone,
		@NotBlank @Email @Size(max = 255) String guestEmail,
		@Size(max = 2000) String notes,
		String locale
) {
}
