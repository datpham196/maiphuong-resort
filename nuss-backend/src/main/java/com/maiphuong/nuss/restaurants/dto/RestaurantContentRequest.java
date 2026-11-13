package com.maiphuong.nuss.restaurants.dto;

public record RestaurantContentRequest(
		String slug,
		String title,
		String shortDescription,
		String seoTitle,
		String seoDescription,
		Object documentDraft
) {
}
