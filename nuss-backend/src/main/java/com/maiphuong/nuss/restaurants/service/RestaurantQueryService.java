package com.maiphuong.nuss.restaurants.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.restaurants.dto.PublicRestaurantResponse;
import com.maiphuong.nuss.restaurants.entity.RestaurantContent;
import com.maiphuong.nuss.restaurants.repository.RestaurantContentRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class RestaurantQueryService {

	private final RestaurantContentRepository contentRepository;
	private final ObjectMapper objectMapper;

	public RestaurantQueryService(RestaurantContentRepository contentRepository, ObjectMapper objectMapper) {
		this.contentRepository = contentRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public List<PublicRestaurantResponse> list(String locale) {
		String normalized = normalizeLocale(locale);
		return contentRepository.findPublishedByLocale(normalized).stream()
				.map(this::toPublic)
				.toList();
	}

	@Transactional(readOnly = true)
	public PublicRestaurantResponse getBySlug(String slug, String locale) {
		String normalized = normalizeLocale(locale);
		RestaurantContent content = contentRepository.findPublishedBySlugAndLocale(slug, normalized)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Restaurant not found"));
		return toPublic(content);
	}

	@Transactional(readOnly = true)
	public PublicRestaurantResponse getPreview(String token, RestaurantPreviewTokenService previewTokenService) {
		RestaurantPreviewTokenService.PreviewRef ref = previewTokenService.resolve(token);
		RestaurantContent content = contentRepository.findByRestaurantIdAndLocale(ref.restaurantId(), ref.locale())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Restaurant content not found"));
		return toPreview(content);
	}

	private PublicRestaurantResponse toPublic(RestaurantContent content) {
		return new PublicRestaurantResponse(
				content.getRestaurant().getId(),
				content.getRestaurant().getKind(),
				content.getSlug(),
				content.getTitle(),
				content.getShortDescription(),
				content.getSeoTitle(),
				content.getSeoDescription(),
				content.getRestaurant().getCoverImageUrl(),
				content.getRestaurant().getDisplayOrder(),
				readJson(content.getDocumentPublished())
		);
	}

	private PublicRestaurantResponse toPreview(RestaurantContent content) {
		return new PublicRestaurantResponse(
				content.getRestaurant().getId(),
				content.getRestaurant().getKind(),
				content.getSlug(),
				content.getTitle(),
				content.getShortDescription(),
				content.getSeoTitle(),
				content.getSeoDescription(),
				content.getRestaurant().getCoverImageUrl(),
				content.getRestaurant().getDisplayOrder(),
				readJson(content.getDocumentDraft())
		);
	}

	private Object readJson(String raw) {
		if (raw == null || raw.isBlank()) {
			return Map.of();
		}
		try {
			return objectMapper.readValue(raw, Object.class);
		} catch (Exception ex) {
			return Map.of();
		}
	}

	private String normalizeLocale(String locale) {
		if (locale == null || locale.isBlank()) {
			return "vi";
		}
		String lower = locale.trim().toLowerCase();
		if (lower.startsWith("en")) {
			return "en";
		}
		return "vi";
	}
}
