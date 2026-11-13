package com.maiphuong.nuss.experiences.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record AdminExperienceResponse(
		UUID id,
		String group,
		String layout,
		int displayOrder,
		boolean active,
		List<AdminContentSummary> contents,
		List<ExperienceImageResponse> images
) {
	public record AdminContentSummary(
			String locale,
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
			boolean published,
			String cmsStatus
	) {
	}
}
