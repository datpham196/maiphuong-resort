package com.maiphuong.nuss.restaurants.dto;

public record PreviewTokenResponse(
		String token,
		long expiresInSeconds
) {
}
