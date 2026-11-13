package com.maiphuong.nuss.experiences.dto;

import java.util.UUID;

public record ExperienceImageResponse(
		UUID id,
		String url,
		String altText,
		int displayOrder,
		boolean cover
) {
}
