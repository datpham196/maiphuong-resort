package com.maiphuong.nuss.auth.dto;

public record LoginResponse(
		String accessToken,
		String username,
		String role
) {
}
