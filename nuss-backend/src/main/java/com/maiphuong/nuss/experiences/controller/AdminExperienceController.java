package com.maiphuong.nuss.experiences.controller;

import com.maiphuong.nuss.experiences.dto.AdminExperienceResponse;
import com.maiphuong.nuss.experiences.dto.CreateExperienceRequest;
import com.maiphuong.nuss.experiences.dto.ExperienceContentRequest;
import com.maiphuong.nuss.experiences.dto.ExperienceImageResponse;
import com.maiphuong.nuss.experiences.dto.UpdateExperienceRequest;
import com.maiphuong.nuss.experiences.service.ExperienceAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/experiences")
public class AdminExperienceController {

	private final ExperienceAdminService experienceAdminService;

	public AdminExperienceController(ExperienceAdminService experienceAdminService) {
		this.experienceAdminService = experienceAdminService;
	}

	@GetMapping
	public List<AdminExperienceResponse> list() {
		return experienceAdminService.list();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AdminExperienceResponse create(@RequestBody CreateExperienceRequest request) {
		return experienceAdminService.create(request);
	}

	@GetMapping("/{id}")
	public AdminExperienceResponse get(@PathVariable UUID id) {
		return experienceAdminService.get(id);
	}

	@PutMapping("/{id}")
	public AdminExperienceResponse update(@PathVariable UUID id, @RequestBody UpdateExperienceRequest request) {
		return experienceAdminService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deactivate(@PathVariable UUID id) {
		experienceAdminService.deactivate(id);
	}

	@PutMapping("/{id}/contents/{locale}")
	public AdminExperienceResponse upsertContent(
			@PathVariable UUID id,
			@PathVariable String locale,
			@RequestBody ExperienceContentRequest request
	) {
		return experienceAdminService.upsertContent(id, locale, request);
	}

	@PostMapping("/{id}/contents/{locale}/publish")
	public AdminExperienceResponse publish(@PathVariable UUID id, @PathVariable String locale) {
		return experienceAdminService.publish(id, locale);
	}

	@PostMapping("/{id}/contents/{locale}/unpublish")
	public AdminExperienceResponse unpublish(@PathVariable UUID id, @PathVariable String locale) {
		return experienceAdminService.unpublish(id, locale);
	}

	@PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
	public ExperienceImageResponse upload(
			@PathVariable UUID id,
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "altText", required = false) String altText,
			@RequestParam(value = "asCover", defaultValue = "false") boolean asCover
	) {
		return experienceAdminService.uploadImage(id, file, altText, asCover);
	}

	@PutMapping("/{id}/images/reorder")
	public List<ExperienceImageResponse> reorder(@PathVariable UUID id, @RequestBody Map<String, List<UUID>> body) {
		return experienceAdminService.reorderImages(id, body.getOrDefault("orderedIds", List.of()));
	}

	@PutMapping("/{id}/images/{imageId}/cover")
	public ExperienceImageResponse cover(@PathVariable UUID id, @PathVariable UUID imageId) {
		return experienceAdminService.setCover(id, imageId);
	}

	@DeleteMapping("/{id}/images/{imageId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteImage(@PathVariable UUID id, @PathVariable UUID imageId) {
		experienceAdminService.deleteImage(id, imageId);
	}
}
