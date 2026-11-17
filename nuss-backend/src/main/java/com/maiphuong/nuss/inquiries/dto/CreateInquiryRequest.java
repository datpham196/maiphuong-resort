package com.maiphuong.nuss.inquiries.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateInquiryRequest(
		@NotBlank(message = "guestName must not be blank") @Size(max = 255) String guestName,
		@NotBlank(message = "guestEmail must not be blank") @Email(message = "guestEmail must be a valid email") @Size(max = 255) String guestEmail,
		@Size(max = 50) String guestPhone,
		@NotBlank(message = "question must not be blank") @Size(max = 4000) String question
) {
}
