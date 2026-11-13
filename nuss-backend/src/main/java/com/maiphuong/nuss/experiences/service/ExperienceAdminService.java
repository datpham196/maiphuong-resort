package com.maiphuong.nuss.experiences.service;

import com.maiphuong.nuss.experiences.dto.AdminExperienceResponse;
import com.maiphuong.nuss.experiences.dto.CreateExperienceRequest;
import com.maiphuong.nuss.experiences.dto.ExperienceContentRequest;
import com.maiphuong.nuss.experiences.dto.ExperienceImageResponse;
import com.maiphuong.nuss.experiences.dto.UpdateExperienceRequest;
import com.maiphuong.nuss.experiences.entity.Experience;
import com.maiphuong.nuss.experiences.entity.ExperienceContent;
import com.maiphuong.nuss.experiences.entity.ExperienceImage;
import com.maiphuong.nuss.experiences.repository.ExperienceContentRepository;
import com.maiphuong.nuss.experiences.repository.ExperienceImageRepository;
import com.maiphuong.nuss.experiences.repository.ExperienceRepository;
import com.maiphuong.nuss.rooms.service.ImageStorageService;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ExperienceAdminService {

	private static final Set<String> GROUPS = Set.of("destination", "tour", "ticket");
	private static final Set<String> LAYOUTS = Set.of("layout1", "layout2", "layout3");
	private static final Map<String, String> DEFAULT_LAYOUT = Map.of(
			"destination", "layout1",
			"tour", "layout2",
			"ticket", "layout3"
	);

	private final ExperienceRepository experienceRepository;
	private final ExperienceContentRepository contentRepository;
	private final ExperienceImageRepository imageRepository;
	private final ImageStorageService imageStorageService;

	public ExperienceAdminService(
			ExperienceRepository experienceRepository,
			ExperienceContentRepository contentRepository,
			ExperienceImageRepository imageRepository,
			ImageStorageService imageStorageService
	) {
		this.experienceRepository = experienceRepository;
		this.contentRepository = contentRepository;
		this.imageRepository = imageRepository;
		this.imageStorageService = imageStorageService;
	}

	@Transactional(readOnly = true)
	public List<AdminExperienceResponse> list() {
		return experienceRepository.findAllByOrderByExperienceGroupAscDisplayOrderAsc().stream()
				.map(this::toAdmin)
				.toList();
	}

	@Transactional(readOnly = true)
	public AdminExperienceResponse get(UUID id) {
		return toAdmin(requireExperience(id));
	}

	@Transactional
	public AdminExperienceResponse create(CreateExperienceRequest request) {
		String group = requireGroup(request.group());
		String layout = request.layout() == null || request.layout().isBlank()
				? DEFAULT_LAYOUT.get(group)
				: requireLayout(request.layout());
		String locale = request.locale() == null || request.locale().isBlank() ? "vi" : request.locale();
		validateLocale(locale);

		Experience experience = new Experience();
		experience.setExperienceGroup(group);
		experience.setLayout(layout);
		experience.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
		experience.setActive(true);
		experienceRepository.save(experience);

		if (request.content() != null) {
			upsertContentInternal(experience, locale, request.content());
		}
		return toAdmin(experience);
	}

	@Transactional
	public AdminExperienceResponse update(UUID id, UpdateExperienceRequest request) {
		Experience experience = requireExperience(id);
		if (request.group() != null && !request.group().isBlank()) {
			experience.setExperienceGroup(requireGroup(request.group()));
		}
		if (request.layout() != null && !request.layout().isBlank()) {
			experience.setLayout(requireLayout(request.layout()));
		}
		if (request.displayOrder() != null) {
			experience.setDisplayOrder(request.displayOrder());
		}
		if (request.active() != null) {
			experience.setActive(request.active());
		}
		experienceRepository.save(experience);
		return toAdmin(experience);
	}

	@Transactional
	public AdminExperienceResponse upsertContent(UUID id, String locale, ExperienceContentRequest request) {
		validateLocale(locale);
		Experience experience = requireExperience(id);
		upsertContentInternal(experience, locale, request);
		return toAdmin(experience);
	}

	@Transactional
	public AdminExperienceResponse publish(UUID id, String locale) {
		validateLocale(locale);
		Experience experience = requireExperience(id);
		ExperienceContent content = contentRepository.findByExperienceIdAndLocale(id, locale)
				.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "CONTENT_MISSING", "Content for locale is missing"));
		if (!experience.isActive()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "EXPERIENCE_INACTIVE", "Cannot publish inactive experience");
		}
		if (blankToNull(content.getTitle()) == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "TITLE_REQUIRED", "Title is required to publish");
		}
		if (blankToNull(content.getSlug()) == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "SLUG_REQUIRED", "Slug is required to publish");
		}
		content.setPublished(true);
		contentRepository.save(content);
		return toAdmin(experience);
	}

	@Transactional
	public AdminExperienceResponse unpublish(UUID id, String locale) {
		validateLocale(locale);
		Experience experience = requireExperience(id);
		ExperienceContent content = contentRepository.findByExperienceIdAndLocale(id, locale)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_MISSING", "Content for locale is missing"));
		content.setPublished(false);
		contentRepository.save(content);
		return toAdmin(experience);
	}

	@Transactional
	public ExperienceImageResponse uploadImage(UUID id, MultipartFile file, String altText, boolean asCover) {
		Experience experience = requireExperience(id);
		boolean hasCover = imageRepository.findFirstByExperienceIdAndCoverTrue(id).isPresent();
		if (asCover && hasCover) {
			throw new ApiException(
					HttpStatus.CONFLICT,
					"COVER_EXISTS",
					"Cover image already exists. Delete the current cover before uploading a new one"
			);
		}
		ImageStorageService.StoredFile stored = imageStorageService.store("experiences", id, file);
		ExperienceImage image = new ExperienceImage();
		image.setExperience(experience);
		image.setStorageKey(stored.storageKey());
		image.setImageUrl(stored.publicUrl());
		image.setAltText(blankToNull(altText));
		image.setDisplayOrder((int) imageRepository.countByExperienceId(id));
		image.setCover(asCover);
		imageRepository.save(image);
		return toImage(image);
	}

	@Transactional
	public List<ExperienceImageResponse> reorderImages(UUID id, List<UUID> orderedIds) {
		requireExperience(id);
		List<ExperienceImage> images = imageRepository.findByExperienceIdOrderByDisplayOrderAsc(id);
		if (orderedIds.size() != images.size()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "REORDER_INVALID", "Image order list is incomplete");
		}
		for (int i = 0; i < orderedIds.size(); i++) {
			UUID imageId = orderedIds.get(i);
			ExperienceImage image = images.stream().filter(img -> img.getId().equals(imageId)).findFirst()
					.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "REORDER_INVALID", "Unknown image id"));
			image.setDisplayOrder(i);
			imageRepository.save(image);
		}
		return imageRepository.findByExperienceIdOrderByDisplayOrderAsc(id).stream().map(this::toImage).toList();
	}

	@Transactional
	public ExperienceImageResponse setCover(UUID id, UUID imageId) {
		requireExperience(id);
		ExperienceImage image = imageRepository.findByIdAndExperienceId(imageId, id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND", "Image not found"));
		imageRepository.clearCover(id);
		image.setCover(true);
		imageRepository.save(image);
		return toImage(image);
	}

	@Transactional
	public void deleteImage(UUID id, UUID imageId) {
		requireExperience(id);
		ExperienceImage image = imageRepository.findByIdAndExperienceId(imageId, id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND", "Image not found"));
		boolean wasCover = image.isCover();
		String key = image.getStorageKey();
		imageRepository.delete(image);
		imageStorageService.delete(key);
		if (wasCover) {
			List<ExperienceImage> remaining = imageRepository.findByExperienceIdOrderByDisplayOrderAsc(id);
			if (!remaining.isEmpty()) {
				ExperienceImage next = remaining.getFirst();
				next.setCover(true);
				imageRepository.save(next);
			}
		}
	}

	@Transactional
	public void deactivate(UUID id) {
		Experience experience = requireExperience(id);
		experience.setActive(false);
		experienceRepository.save(experience);
		List<ExperienceContent> contents = contentRepository.findByExperienceId(id);
		for (ExperienceContent content : contents) {
			content.setPublished(false);
			contentRepository.save(content);
		}
	}

	private void upsertContentInternal(Experience experience, String locale, ExperienceContentRequest request) {
		ExperienceContent content = contentRepository.findByExperienceIdAndLocale(experience.getId(), locale)
				.orElseGet(() -> {
					ExperienceContent created = new ExperienceContent();
					created.setExperience(experience);
					created.setLocale(locale);
					return created;
				});

		String slug = normalizeSlug(request.slug());
		if (slug != null && contentRepository.existsByLocaleAndSlugAndExperienceIdNot(locale, slug, experience.getId())) {
			throw new ApiException(HttpStatus.CONFLICT, "SLUG_TAKEN", "Slug already used for this locale");
		}

		content.setSlug(slug);
		content.setTitle(blankToNull(request.title()));
		content.setShortDescription(blankToNull(request.shortDescription()));
		content.setDescription(blankToNull(request.description()));
		content.setItinerary(blankToNull(request.itinerary()));
		content.setDurationText(blankToNull(request.durationText()));
		content.setPriceAmount(request.priceAmount());
		content.setPriceCurrency(blankToNull(request.priceCurrency()) == null ? "VND" : request.priceCurrency().trim().toUpperCase());
		content.setPriceNote(blankToNull(request.priceNote()));
		content.setConditions(blankToNull(request.conditions()));
		content.setSeoTitle(blankToNull(request.seoTitle()));
		content.setSeoDescription(blankToNull(request.seoDescription()));
		contentRepository.save(content);
	}

	private AdminExperienceResponse toAdmin(Experience experience) {
		List<ExperienceContent> contents = contentRepository.findByExperienceId(experience.getId());
		List<AdminExperienceResponse.AdminContentSummary> summaries = new ArrayList<>();
		for (String locale : List.of("vi", "en")) {
			ExperienceContent content = contents.stream().filter(c -> locale.equals(c.getLocale())).findFirst().orElse(null);
			String status;
			if (content == null) {
				status = "Missing";
			} else if (content.isPublished()) {
				status = "Published";
			} else {
				status = "Draft";
			}
			summaries.add(new AdminExperienceResponse.AdminContentSummary(
					locale,
					content == null ? null : content.getSlug(),
					content == null ? null : content.getTitle(),
					content == null ? null : content.getShortDescription(),
					content == null ? null : content.getDescription(),
					content == null ? null : content.getItinerary(),
					content == null ? null : content.getDurationText(),
					content == null ? null : content.getPriceAmount(),
					content == null ? null : content.getPriceCurrency(),
					content == null ? null : content.getPriceNote(),
					content == null ? null : content.getConditions(),
					content == null ? null : content.getSeoTitle(),
					content == null ? null : content.getSeoDescription(),
					content != null && content.isPublished(),
					status
			));
		}
		List<ExperienceImageResponse> images = imageRepository.findByExperienceIdOrderByDisplayOrderAsc(experience.getId())
				.stream().map(this::toImage).toList();
		return new AdminExperienceResponse(
				experience.getId(),
				experience.getExperienceGroup(),
				experience.getLayout(),
				experience.getDisplayOrder(),
				experience.isActive(),
				summaries,
				images
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

	private Experience requireExperience(UUID id) {
		return experienceRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EXPERIENCE_NOT_FOUND", "Experience not found"));
	}

	private String requireGroup(String group) {
		if (group == null || !GROUPS.contains(group.trim().toLowerCase())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "GROUP_INVALID", "Group must be destination, tour or ticket");
		}
		return group.trim().toLowerCase();
	}

	private String requireLayout(String layout) {
		if (layout == null || !LAYOUTS.contains(layout.trim().toLowerCase())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "LAYOUT_INVALID", "Layout must be layout1, layout2 or layout3");
		}
		return layout.trim().toLowerCase();
	}

	private void validateLocale(String locale) {
		if (!"vi".equals(locale) && !"en".equals(locale)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "LOCALE_INVALID", "Locale must be vi or en");
		}
	}

	private String normalizeSlug(String slug) {
		if (slug == null || slug.isBlank()) {
			return null;
		}
		return slug.trim().toLowerCase().replaceAll("[^a-z0-9-]+", "-").replaceAll("^-+|-+$", "");
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
