package com.maiphuong.nuss.inquiries.dto;

import java.util.UUID;

public record InquiryResponse(
		UUID id,
		String status,
		String message
) {
}
