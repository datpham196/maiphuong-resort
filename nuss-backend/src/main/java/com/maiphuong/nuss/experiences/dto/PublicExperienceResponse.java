package com.maiphuong.nuss.experiences.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PublicExperienceResponse(
		UUID id,
		String group,
		String layout,
		String slug,
		String title,
		String shortDescription,
		String description,
		String itinerary,
		String durationText,
		BigDecimal priceAmount,
		String priceCurrency,
		String priceNote,
		String conditions,
		String seoTitle,
		String seoDescription,
		int displayOrder,
		ExperienceImageResponse coverImage,
		List<ExperienceImageResponse> images
) {
}
