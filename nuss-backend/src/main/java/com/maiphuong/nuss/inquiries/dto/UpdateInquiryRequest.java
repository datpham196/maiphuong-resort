package com.maiphuong.nuss.inquiries.dto;

import jakarta.validation.constraints.Size;

public record UpdateInquiryRequest(
		@Size(max = 30) String status,
		@Size(max = 8000) String staffAnswer,
		Boolean sendToGuest
) {
}
