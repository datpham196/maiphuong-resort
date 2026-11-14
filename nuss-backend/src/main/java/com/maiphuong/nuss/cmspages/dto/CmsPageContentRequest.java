package com.maiphuong.nuss.cmspages.dto;

public record CmsPageContentRequest(
		String slug,
		String title,
		String shortDescription,
		String seoTitle,
		String seoDescription,
		Object documentDraft
) {
}
