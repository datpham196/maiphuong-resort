package com.maiphuong.nuss.restaurants.dto;

public record UpdateRestaurantRequest(
		Integer displayOrder,
		Boolean active,
		String coverImageUrl
) {
}
