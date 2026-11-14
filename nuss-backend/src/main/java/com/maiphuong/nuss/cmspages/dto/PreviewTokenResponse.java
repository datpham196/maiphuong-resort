package com.maiphuong.nuss.cmspages.dto;

public record PreviewTokenResponse(
		String token,
		long expiresInSeconds
) {
}
