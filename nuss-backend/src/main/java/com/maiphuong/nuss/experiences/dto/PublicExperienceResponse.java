package com.maiphuong.nuss.experiences.dto;

import java.util.List;
import java.util.UUID;

public record PublicExperienceResponse(
		UUID id,
		String group,
		String layout,
		String slug,
		String title,
		String shortDescription,
		String seoTitle,
		String seoDescription,
		int displayOrder,
		Object document,
		ExperienceImageResponse coverImage,
		List<ExperienceImageResponse> images
) {
}
