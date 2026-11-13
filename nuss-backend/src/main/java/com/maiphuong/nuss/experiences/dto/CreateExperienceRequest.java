package com.maiphuong.nuss.experiences.dto;

public record CreateExperienceRequest(
		String group,
		String layout,
		Integer displayOrder,
		String locale,
		ExperienceContentRequest content
) {
}
