package com.maiphuong.nuss.experiences.controller;

import com.maiphuong.nuss.experiences.dto.PublicExperienceResponse;
import com.maiphuong.nuss.experiences.service.ExperiencePreviewTokenService;
import com.maiphuong.nuss.experiences.service.ExperienceQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/experiences")
public class PublicExperienceController {

	private final ExperienceQueryService experienceQueryService;
	private final ExperiencePreviewTokenService previewTokenService;

	public PublicExperienceController(
			ExperienceQueryService experienceQueryService,
			ExperiencePreviewTokenService previewTokenService
	) {
		this.experienceQueryService = experienceQueryService;
		this.previewTokenService = previewTokenService;
	}

	@GetMapping
	public List<PublicExperienceResponse> list(
			@RequestParam(defaultValue = "vi") String locale,
			@RequestParam(required = false) String group
	) {
		return experienceQueryService.list(locale, group);
	}

	@GetMapping("/preview")
	public PublicExperienceResponse preview(@RequestParam String token) {
		return experienceQueryService.getPreview(token, previewTokenService);
	}

	@GetMapping("/{slug}")
	public PublicExperienceResponse detail(
			@PathVariable String slug,
			@RequestParam(defaultValue = "vi") String locale
	) {
		return experienceQueryService.getBySlug(slug, locale);
	}
}
