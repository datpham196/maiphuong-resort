package com.maiphuong.nuss.rooms.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.rooms.dto.PublicRoomResponse;
import com.maiphuong.nuss.rooms.dto.RoomImageResponse;
import com.maiphuong.nuss.rooms.entity.RoomContent;
import com.maiphuong.nuss.rooms.entity.RoomImage;
import com.maiphuong.nuss.rooms.entity.RoomType;
import com.maiphuong.nuss.rooms.repository.RoomContentRepository;
import com.maiphuong.nuss.rooms.repository.RoomImageRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomQueryService {

	private final RoomContentRepository roomContentRepository;
	private final RoomImageRepository roomImageRepository;
	private final ObjectMapper objectMapper;

	public RoomQueryService(
			RoomContentRepository roomContentRepository,
			RoomImageRepository roomImageRepository,
			ObjectMapper objectMapper
	) {
		this.roomContentRepository = roomContentRepository;
		this.roomImageRepository = roomImageRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public List<PublicRoomResponse> list(String locale) {
		String resolved = resolveLocale(locale);
		return roomContentRepository.findPublishedByLocale(resolved).stream()
				.map(content -> toPublic(content, false))
				.toList();
	}

	@Transactional(readOnly = true)
	public PublicRoomResponse getBySlug(String slug, String locale) {
		String resolved = resolveLocale(locale);
		RoomContent content = roomContentRepository.findByLocaleAndSlugAndPublishedTrue(resolved, slug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found"));
		if (!content.getRoomType().isActive()) {
			throw new ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found");
		}
		return toPublic(content, true);
	}

	private PublicRoomResponse toPublic(RoomContent content, boolean includeGallery) {
		RoomType roomType = content.getRoomType();
		List<RoomImage> images = roomImageRepository.findByRoomTypeIdOrderByDisplayOrderAsc(roomType.getId());
		RoomImageResponse cover = images.stream()
				.filter(RoomImage::isCover)
				.findFirst()
				.or(() -> images.stream().findFirst())
				.map(this::toImage)
				.orElse(null);
		List<RoomImageResponse> gallery = includeGallery
				? images.stream().map(this::toImage).toList()
				: List.of();

		String title = content.getTitle() != null ? content.getTitle() : roomType.getName();
		return new PublicRoomResponse(
				roomType.getId(),
				content.getSlug(),
				roomType.getExternalId(),
				roomType.getName(),
				roomType.getMaxOccupancy(),
				roomType.getRackRate(),
				"VND",
				new PublicRoomResponse.Content(
						content.getLocale(),
						title,
						content.getShortDescription(),
						content.getDescription(),
						readAmenities(content.getAmenities()),
						content.getSeoTitle(),
						content.getSeoDescription()
				),
				cover,
				gallery
		);
	}

	private RoomImageResponse toImage(RoomImage image) {
		return new RoomImageResponse(image.getId(), image.getImageUrl(), image.getAltText(), image.getDisplayOrder(), image.isCover());
	}

	private List<String> readAmenities(String json) {
		try {
			return objectMapper.readValue(json == null ? "[]" : json, new TypeReference<>() {
			});
		} catch (Exception ex) {
			return List.of();
		}
	}

	private String resolveLocale(String locale) {
		if (locale == null || locale.isBlank()) {
			return "vi";
		}
		String normalized = locale.trim().toLowerCase();
		return normalized.startsWith("en") ? "en" : "vi";
	}
}
