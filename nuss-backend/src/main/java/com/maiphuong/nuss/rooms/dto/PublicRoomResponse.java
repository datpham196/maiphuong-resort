package com.maiphuong.nuss.rooms.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PublicRoomResponse(
		UUID id,
		String slug,
		String externalId,
		String pmsName,
		Integer maxOccupancy,
		BigDecimal rackRate,
		String currency,
		Content content,
		RoomImageResponse coverImage,
		List<RoomImageResponse> images
) {
	public record Content(
			String locale,
			String title,
			String shortDescription,
			String description,
			List<String> amenities,
			String seoTitle,
			String seoDescription
	) {
	}
}
