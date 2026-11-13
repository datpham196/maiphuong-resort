package com.maiphuong.nuss.experiences.dto;

public record UpdateExperienceRequest(
		String group,
		String layout,
		Integer displayOrder,
		Boolean active
) {
}
