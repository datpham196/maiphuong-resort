package com.maiphuong.nuss.restaurants.dto;

import java.util.UUID;

public record PublicRestaurantResponse(
		UUID id,
		String kind,
		String slug,
		String title,
		String shortDescription,
		String seoTitle,
		String seoDescription,
		String coverImageUrl,
		int displayOrder,
		Object document
) {
}
