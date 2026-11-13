package com.maiphuong.nuss.experiences.service;

import com.maiphuong.nuss.experiences.dto.ExperienceImageResponse;
import com.maiphuong.nuss.experiences.dto.PublicExperienceResponse;
import com.maiphuong.nuss.experiences.entity.Experience;
import com.maiphuong.nuss.experiences.entity.ExperienceContent;
import com.maiphuong.nuss.experiences.entity.ExperienceImage;
import com.maiphuong.nuss.experiences.repository.ExperienceContentRepository;
import com.maiphuong.nuss.experiences.repository.ExperienceImageRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class ExperienceQueryService {

	private static final Set<String> GROUPS = Set.of("destination", "tour", "ticket");

	private final ExperienceContentRepository contentRepository;
	private final ExperienceImageRepository imageRepository;

	public ExperienceQueryService(
			ExperienceContentRepository contentRepository,
			ExperienceImageRepository imageRepository
	) {
		this.contentRepository = contentRepository;
		this.imageRepository = imageRepository;
	}

	@Transactional(readOnly = true)
	public List<PublicExperienceResponse> list(String locale, String group) {
		String resolvedLocale = resolveLocale(locale);
		String resolvedGroup = resolveGroup(group);
		return contentRepository.findPublished(resolvedLocale, resolvedGroup).stream()
				.map(content -> toPublic(content, false))
				.toList();
	}

	@Transactional(readOnly = true)
	public PublicExperienceResponse getBySlug(String slug, String locale) {
		String resolvedLocale = resolveLocale(locale);
		ExperienceContent content = contentRepository.findByLocaleAndSlugAndPublishedTrue(resolvedLocale, slug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EXPERIENCE_NOT_FOUND", "Experience not found"));
		if (!content.getExperience().isActive()) {
			throw new ApiException(HttpStatus.NOT_FOUND, "EXPERIENCE_NOT_FOUND", "Experience not found");
		}
		return toPublic(content, true);
	}

	private PublicExperienceResponse toPublic(ExperienceContent content, boolean includeGallery) {
		Experience experience = content.getExperience();
		List<ExperienceImage> images = imageRepository.findByExperienceIdOrderByDisplayOrderAsc(experience.getId());
		ExperienceImageResponse cover = images.stream()
				.filter(ExperienceImage::isCover)
				.findFirst()
				.or(() -> images.stream().findFirst())
				.map(this::toImage)
				.orElse(null);
		List<ExperienceImageResponse> gallery = includeGallery
				? images.stream().map(this::toImage).toList()
				: List.of();

		return new PublicExperienceResponse(
				experience.getId(),
				experience.getExperienceGroup(),
				experience.getLayout(),
				content.getSlug(),
				content.getTitle(),
				content.getShortDescription(),
				content.getDescription(),
				content.getItinerary(),
				content.getDurationText(),
				content.getPriceAmount(),
				content.getPriceCurrency(),
				content.getPriceNote(),
				content.getConditions(),
				content.getSeoTitle(),
				content.getSeoDescription(),
				experience.getDisplayOrder(),
				cover,
				gallery
		);
	}

	private ExperienceImageResponse toImage(ExperienceImage image) {
		return new ExperienceImageResponse(
				image.getId(),
				image.getImageUrl(),
				image.getAltText(),
				image.getDisplayOrder(),
				image.isCover()
		);
	}

	private String resolveLocale(String locale) {
		if (locale == null || locale.isBlank()) {
			return "vi";
		}
		String normalized = locale.trim().toLowerCase();
		return normalized.startsWith("en") ? "en" : "vi";
	}

	private String resolveGroup(String group) {
		if (group == null || group.isBlank()) {
			return null;
		}
		String normalized = group.trim().toLowerCase();
		if (!GROUPS.contains(normalized)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "GROUP_INVALID", "Group must be destination, tour or ticket");
		}
		return normalized;
	}
}
