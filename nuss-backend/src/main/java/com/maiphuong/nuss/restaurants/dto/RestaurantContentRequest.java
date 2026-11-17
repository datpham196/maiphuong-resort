package com.maiphuong.nuss.restaurants.dto;

public record RestaurantContentRequest(
		String slug,
		String title,
		String shortDescription,
		String seoTitle,
		String seoDescription,
		String heroSubtitle,
		String introEyebrow,
		String introHeading,
		String introBody,
		String introBodySecondary,
		String menuSectionEyebrow,
		String menuSectionHeading,
		String menuSectionLead
) {
}
