package com.maiphuong.nuss.restaurants.dto;

import java.util.UUID;

public record RestaurantImageResponse(
		UUID id,
		String role,
		String url,
		String altText,
		int displayOrder
) {
}
