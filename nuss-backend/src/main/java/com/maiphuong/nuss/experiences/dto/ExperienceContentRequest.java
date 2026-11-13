package com.maiphuong.nuss.experiences.dto;

import java.math.BigDecimal;

public record ExperienceContentRequest(
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
		String seoDescription
) {
}
