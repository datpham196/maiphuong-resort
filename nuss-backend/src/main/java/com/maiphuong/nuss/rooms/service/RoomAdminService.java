package com.maiphuong.nuss.rooms.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.rooms.dto.AdminRoomTypeResponse;
import com.maiphuong.nuss.rooms.dto.RoomContentRequest;
import com.maiphuong.nuss.rooms.dto.RoomImageResponse;
import com.maiphuong.nuss.rooms.entity.RoomContent;
import com.maiphuong.nuss.rooms.entity.RoomImage;
import com.maiphuong.nuss.rooms.entity.RoomType;
import com.maiphuong.nuss.rooms.repository.RoomContentRepository;
import com.maiphuong.nuss.rooms.repository.RoomImageRepository;
import com.maiphuong.nuss.rooms.repository.RoomTypeRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RoomAdminService {

	private final RoomTypeRepository roomTypeRepository;
	private final RoomContentRepository roomContentRepository;
	private final RoomImageRepository roomImageRepository;
	private final ImageStorageService imageStorageService;
	private final ObjectMapper objectMapper;

	public RoomAdminService(
			RoomTypeRepository roomTypeRepository,
			RoomContentRepository roomContentRepository,
			RoomImageRepository roomImageRepository,
			ImageStorageService imageStorageService,
			ObjectMapper objectMapper
	) {
		this.roomTypeRepository = roomTypeRepository;
		this.roomContentRepository = roomContentRepository;
		this.roomImageRepository = roomImageRepository;
		this.imageStorageService = imageStorageService;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public List<AdminRoomTypeResponse> list() {
		return roomTypeRepository.findAllByOrderByNameAsc().stream().map(this::toAdmin).toList();
	}

	@Transactional(readOnly = true)
	public AdminRoomTypeResponse get(UUID id) {
		return toAdmin(requireRoom(id));
	}

	@Transactional
	public AdminRoomTypeResponse upsertContent(UUID roomTypeId, String locale, RoomContentRequest request) {
		validateLocale(locale);
		RoomType roomType = requireRoom(roomTypeId);
		RoomContent content = roomContentRepository.findByRoomTypeIdAndLocale(roomTypeId, locale)
				.orElseGet(() -> {
					RoomContent created = new RoomContent();
					created.setRoomType(roomType);
					created.setLocale(locale);
					return created;
				});

		String slug = normalizeSlug(request.slug());
		if (slug != null && roomContentRepository.existsByLocaleAndSlugAndRoomTypeIdNot(locale, slug, roomTypeId)) {
			throw new ApiException(HttpStatus.CONFLICT, "SLUG_TAKEN", "Slug already used for this locale");
		}

		content.setSlug(slug);
		content.setTitle(blankToNull(request.title()));
		content.setShortDescription(blankToNull(request.shortDescription()));
		content.setDescription(blankToNull(request.description()));
		content.setSeoTitle(blankToNull(request.seoTitle()));
		content.setSeoDescription(blankToNull(request.seoDescription()));
		if (request.displayOrder() != null) {
			content.setDisplayOrder(request.displayOrder());
		}
		content.setAmenities(writeAmenities(request.amenities()));
		roomContentRepository.save(content);
		return toAdmin(roomType);
	}

	@Transactional
	public AdminRoomTypeResponse publish(UUID roomTypeId, String locale) {
		validateLocale(locale);
		RoomType roomType = requireRoom(roomTypeId);
		RoomContent content = roomContentRepository.findByRoomTypeIdAndLocale(roomTypeId, locale)
				.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "CONTENT_MISSING", "Content for locale is missing"));
		if (!roomType.isActive()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "ROOM_INACTIVE", "Cannot publish inactive room type");
		}
		if (blankToNull(content.getTitle()) == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "TITLE_REQUIRED", "Title is required to publish");
		}
		if (blankToNull(content.getSlug()) == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "SLUG_REQUIRED", "Slug is required to publish");
		}
		content.setPublished(true);
		roomContentRepository.save(content);
		return toAdmin(roomType);
	}

	@Transactional
	public AdminRoomTypeResponse unpublish(UUID roomTypeId, String locale) {
		validateLocale(locale);
		RoomType roomType = requireRoom(roomTypeId);
		RoomContent content = roomContentRepository.findByRoomTypeIdAndLocale(roomTypeId, locale)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_MISSING", "Content for locale is missing"));
		content.setPublished(false);
		roomContentRepository.save(content);
		return toAdmin(roomType);
	}

	@Transactional
	public RoomImageResponse uploadImage(UUID roomTypeId, MultipartFile file, String altText, boolean asCover) {
		RoomType roomType = requireRoom(roomTypeId);
		boolean hasCover = roomImageRepository.findFirstByRoomTypeIdAndCoverTrue(roomTypeId).isPresent();
		if (asCover && hasCover) {
			throw new ApiException(
					HttpStatus.CONFLICT,
					"COVER_EXISTS",
					"Cover image already exists. Delete the current cover before uploading a new one"
			);
		}
		ImageStorageService.StoredFile stored = imageStorageService.store(roomTypeId, file);
		RoomImage image = new RoomImage();
		image.setRoomType(roomType);
		image.setStorageKey(stored.storageKey());
		image.setImageUrl(stored.publicUrl());
		image.setAltText(blankToNull(altText));
		long count = roomImageRepository.countByRoomTypeId(roomTypeId);
		image.setDisplayOrder((int) count);
		// Cover must be uploaded via asCover; gallery images never auto-promote.
		image.setCover(asCover);
		roomImageRepository.save(image);
		return toImage(image);
	}

	@Transactional
	public List<RoomImageResponse> reorderImages(UUID roomTypeId, List<UUID> orderedIds) {
		requireRoom(roomTypeId);
		List<RoomImage> images = roomImageRepository.findByRoomTypeIdOrderByDisplayOrderAsc(roomTypeId);
		if (orderedIds.size() != images.size()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "REORDER_INVALID", "Image order list is incomplete");
		}
		for (int i = 0; i < orderedIds.size(); i++) {
			UUID id = orderedIds.get(i);
			RoomImage image = images.stream().filter(img -> img.getId().equals(id)).findFirst()
					.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "REORDER_INVALID", "Unknown image id"));
			image.setDisplayOrder(i);
			roomImageRepository.save(image);
		}
		return roomImageRepository.findByRoomTypeIdOrderByDisplayOrderAsc(roomTypeId).stream().map(this::toImage).toList();
	}

	@Transactional
	public RoomImageResponse setCover(UUID roomTypeId, UUID imageId) {
		requireRoom(roomTypeId);
		RoomImage image = roomImageRepository.findByIdAndRoomTypeId(imageId, roomTypeId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND", "Image not found"));
		roomImageRepository.clearCover(roomTypeId);
		image.setCover(true);
		roomImageRepository.save(image);
		return toImage(image);
	}

	@Transactional
	public void deleteImage(UUID roomTypeId, UUID imageId) {
		requireRoom(roomTypeId);
		RoomImage image = roomImageRepository.findByIdAndRoomTypeId(imageId, roomTypeId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND", "Image not found"));
		boolean wasCover = image.isCover();
		String key = image.getStorageKey();
		roomImageRepository.delete(image);
		imageStorageService.delete(key);
		if (wasCover) {
			List<RoomImage> remaining = roomImageRepository.findByRoomTypeIdOrderByDisplayOrderAsc(roomTypeId);
			if (!remaining.isEmpty()) {
				RoomImage next = remaining.getFirst();
				next.setCover(true);
				roomImageRepository.save(next);
			}
		}
	}

	private AdminRoomTypeResponse toAdmin(RoomType roomType) {
		List<RoomContent> contents = roomContentRepository.findByRoomTypeId(roomType.getId());
		List<AdminRoomTypeResponse.AdminContentSummary> summaries = new ArrayList<>();
		for (String locale : List.of("vi", "en")) {
			RoomContent content = contents.stream().filter(c -> locale.equals(c.getLocale())).findFirst().orElse(null);
			String status;
			if (content == null) {
				status = "Missing";
			} else if (content.isPublished()) {
				status = "Published";
			} else {
				status = "Draft";
			}
			summaries.add(new AdminRoomTypeResponse.AdminContentSummary(
					locale,
					content == null ? null : content.getSlug(),
					content == null ? null : content.getTitle(),
					content == null ? null : content.getShortDescription(),
					content == null ? null : content.getDescription(),
					content == null ? List.of() : readAmenities(content.getAmenities()),
					content == null ? null : content.getSeoTitle(),
					content == null ? null : content.getSeoDescription(),
					content == null ? 0 : content.getDisplayOrder(),
					content != null && content.isPublished(),
					status
			));
		}
		List<RoomImageResponse> images = roomImageRepository.findByRoomTypeIdOrderByDisplayOrderAsc(roomType.getId())
				.stream().map(this::toImage).toList();
		return new AdminRoomTypeResponse(
				roomType.getId(),
				roomType.getExternalId(),
				roomType.getName(),
				roomType.getMaxOccupancy(),
				roomType.getRackRate(),
				roomType.getInventoryCount(),
				roomType.isActive(),
				roomType.getLastSeenAt(),
				summaries,
				images
		);
	}

	private RoomImageResponse toImage(RoomImage image) {
		return new RoomImageResponse(image.getId(), image.getImageUrl(), image.getAltText(), image.getDisplayOrder(), image.isCover());
	}

	private RoomType requireRoom(UUID id) {
		return roomTypeRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room type not found"));
	}

	private void validateLocale(String locale) {
		if (!"vi".equals(locale) && !"en".equals(locale)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "LOCALE_INVALID", "Locale must be vi or en");
		}
	}

	private String writeAmenities(List<String> amenities) {
		try {
			return objectMapper.writeValueAsString(amenities == null ? List.of() : amenities);
		} catch (Exception ex) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "AMENITIES_INVALID", "Invalid amenities payload");
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

	private List<String> readAmenities(String json) {
		try {
			return objectMapper.readValue(json == null ? "[]" : json, new TypeReference<>() {
			});
		} catch (Exception ex) {
			return List.of();
		}
	}
}
