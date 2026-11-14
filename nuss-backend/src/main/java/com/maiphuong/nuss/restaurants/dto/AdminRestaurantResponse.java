package com.maiphuong.nuss.restaurants.dto;

import java.util.List;
import java.util.UUID;

public record AdminRestaurantResponse(
		UUID id,
		String kind,
		int displayOrder,
		boolean active,
		String coverImageUrl,
		List<Content> contents
) {
	public record Content(
			String locale,
			String slug,
			String title,
			String shortDescription,
			String seoTitle,
			String seoDescription,
			Object documentDraft,
			Object documentPublished,
			boolean published,
			String cmsStatus
	) {
	}
}
