package com.maiphuong.nuss.bookings.controller;

import com.maiphuong.nuss.bookings.dto.CreateBookingRequest;
import com.maiphuong.nuss.bookings.dto.CreateBookingResponse;
import com.maiphuong.nuss.bookings.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
