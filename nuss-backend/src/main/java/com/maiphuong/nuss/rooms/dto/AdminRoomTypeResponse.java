package com.maiphuong.nuss.rooms.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminRoomTypeResponse(
		UUID id,
		String externalId,
		String name,
		Integer maxOccupancy,
		BigDecimal rackRate,
		Integer inventoryCount,
		boolean active,
		Instant lastSeenAt,
		List<AdminContentSummary> contents,
		List<RoomImageResponse> images
) {
	public record AdminContentSummary(
			String locale,
			String slug,
			String title,
			String shortDescription,
			String description,
			List<String> amenities,
			String seoTitle,
			String seoDescription,
			int displayOrder,
			boolean published,
			String cmsStatus
	) {
	}
}
