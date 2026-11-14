package com.maiphuong.nuss.experiences.dto;

import java.util.List;
import java.util.UUID;

public record AdminExperienceResponse(
		UUID id,
		String group,
		String layout,
		int displayOrder,
		boolean active,
		List<AdminContentSummary> contents,
		List<ExperienceImageResponse> images
) {
	public record AdminContentSummary(
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
