package com.maiphuong.nuss.cmspages.dto;

import java.util.List;
import java.util.UUID;

public record AdminCmsPageResponse(
		UUID id,
		String pageKey,
		boolean active,
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
