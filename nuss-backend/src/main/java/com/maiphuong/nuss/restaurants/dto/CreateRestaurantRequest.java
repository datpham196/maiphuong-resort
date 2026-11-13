package com.maiphuong.nuss.restaurants.dto;

public record CreateRestaurantRequest(
		Integer displayOrder,
		String locale,
		RestaurantContentRequest content
) {
}
