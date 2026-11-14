package com.maiphuong.nuss.bookings.controller;

import com.maiphuong.nuss.bookings.dto.BookingLookupResponse;
import com.maiphuong.nuss.bookings.dto.CancelBookingRequest;
import com.maiphuong.nuss.bookings.dto.CreateBookingRequest;
import com.maiphuong.nuss.bookings.dto.CreateBookingResponse;
import com.maiphuong.nuss.bookings.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class PublicBookingController {

	private final BookingService bookingService;

	public PublicBookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@PostMapping
	public CreateBookingResponse create(@Valid @RequestBody CreateBookingRequest request) {
		return bookingService.create(request);
	}

	@GetMapping("/lookup")
	public BookingLookupResponse lookup(
			@RequestParam("ref") String bookingReference,
			@RequestParam(value = "locale", required = false) String locale
	) {
		return bookingService.lookupByReference(bookingReference, locale);
	}

	@PostMapping("/cancel")
	public BookingLookupResponse cancel(@Valid @RequestBody CancelBookingRequest request) {
		return bookingService.cancelByReference(request);
	}
}
