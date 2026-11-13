package com.maiphuong.nuss.rooms.dto;

import java.util.UUID;

public record RoomImageResponse(
		UUID id,
		String url,
		String altText,
		int displayOrder,
		boolean cover
) {
}
