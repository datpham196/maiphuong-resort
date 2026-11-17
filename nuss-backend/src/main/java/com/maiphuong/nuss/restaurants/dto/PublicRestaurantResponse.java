package com.maiphuong.nuss.restaurants.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PublicRestaurantResponse(
		UUID id,
		String kind,
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
		String coverImageUrl,
		int displayOrder,
		List<RestaurantImageResponse> slides,
		RestaurantImageResponse mainImage,
		RestaurantImageResponse signatureImage,
		List<RestaurantImageResponse> menuImages,
		List<MenuCategory> menu
) {
	public record MenuCategory(
			UUID id,
			String code,
			String name,
			List<MenuItem> items
	) {
	}

	public record MenuItem(
			UUID id,
			String name,
			String description,
			BigDecimal priceAmount,
			String priceCurrency,
			String priceLabel
	) {
	}
}
