package com.maiphuong.nuss.rooms.dto;

import java.util.List;

public record RoomContentRequest(
		String slug,
		String title,
		String shortDescription,
		String description,
		List<String> amenities,
		String seoTitle,
		String seoDescription,
		Integer displayOrder
) {
}
