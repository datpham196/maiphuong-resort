package com.maiphuong.nuss.restaurants.dto;

import java.util.List;
import java.util.UUID;

public record MenuCategoryResponse(
		UUID id,
		String code,
		int displayOrder,
		boolean active,
		List<LocaleName> names
) {
	public record LocaleName(String locale, String name) {
	}
}
