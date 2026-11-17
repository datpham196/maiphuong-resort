package com.maiphuong.nuss.inquiries.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminInquiryResponse(
		UUID id,
		String guestName,
		String guestEmail,
		String guestPhone,
		String question,
		String status,
		String staffAnswer,
		Instant answeredAt,
		Instant createdAt,
		Instant updatedAt
) {
}
