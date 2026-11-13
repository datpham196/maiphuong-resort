package com.maiphuong.nuss.pms.dto;

import java.util.List;

public record OnePmsBookingResult(
		String bookingReference,
		List<String> bookingIds
) {
}
