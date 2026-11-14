package com.maiphuong.nuss.experiences.dto;

public record PreviewTokenResponse(
		String token,
		long expiresInSeconds
) {
}
