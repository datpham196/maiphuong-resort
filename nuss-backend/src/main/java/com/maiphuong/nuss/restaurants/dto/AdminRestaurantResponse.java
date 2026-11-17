package com.maiphuong.nuss.restaurants.dto;

import java.util.List;
import java.util.UUID;

public record AdminRestaurantResponse(
		UUID id,
		String kind,
		int displayOrder,
		boolean active,
		String coverImageUrl,
		List<Content> contents,
		List<RestaurantImageResponse> images
) {
	public record Content(
			String locale,
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
			String menuSectionLead,
			boolean published,
			String cmsStatus
	) {
	}
}
