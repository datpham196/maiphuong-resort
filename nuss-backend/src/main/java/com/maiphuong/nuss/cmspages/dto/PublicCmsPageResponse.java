package com.maiphuong.nuss.cmspages.dto;

import java.util.UUID;

public record PublicCmsPageResponse(
		UUID id,
		String pageKey,
		String slug,
		String title,
		String shortDescription,
		String seoTitle,
		String seoDescription,
		Object document
) {
}
