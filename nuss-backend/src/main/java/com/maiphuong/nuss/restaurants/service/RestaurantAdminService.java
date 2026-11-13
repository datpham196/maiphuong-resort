package com.maiphuong.nuss.restaurants.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.pagebuilder.DocumentValidator;
import com.maiphuong.nuss.restaurants.dto.AdminRestaurantResponse;
import com.maiphuong.nuss.restaurants.dto.CreateRestaurantRequest;
import com.maiphuong.nuss.restaurants.dto.MediaUploadResponse;
import com.maiphuong.nuss.restaurants.dto.PreviewTokenResponse;
import com.maiphuong.nuss.restaurants.dto.RestaurantContentRequest;
import com.maiphuong.nuss.restaurants.dto.UpdateRestaurantRequest;
import com.maiphuong.nuss.restaurants.entity.Restaurant;
import com.maiphuong.nuss.restaurants.entity.RestaurantContent;
import com.maiphuong.nuss.restaurants.repository.RestaurantContentRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantRepository;
import com.maiphuong.nuss.rooms.service.ImageStorageService;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class RestaurantAdminService {

	private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

	private final RestaurantRepository restaurantRepository;
	private final RestaurantContentRepository contentRepository;
	private final ImageStorageService imageStorageService;
	private final DocumentValidator documentValidator;
	private final RestaurantPreviewTokenService previewTokenService;
	private final ObjectMapper objectMapper;

	public RestaurantAdminService(
			RestaurantRepository restaurantRepository,
			RestaurantContentRepository contentRepository,
			ImageStorageService imageStorageService,
			DocumentValidator documentValidator,
			RestaurantPreviewTokenService previewTokenService,
			ObjectMapper objectMapper
	) {
		this.restaurantRepository = restaurantRepository;
		this.contentRepository = contentRepository;
		this.imageStorageService = imageStorageService;
		this.documentValidator = documentValidator;
		this.previewTokenService = previewTokenService;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public List<AdminRestaurantResponse> list() {
		return restaurantRepository.findAllByOrderByDisplayOrderAsc().stream()
				.map(this::toAdmin)
				.toList();
	}

	/** Single restaurant page used by admin builder entry. */
	@Transactional
	public AdminRestaurantResponse getPrimary() {
		return restaurantRepository.findAllByOrderByDisplayOrderAsc().stream()
				.findFirst()
				.map(this::toAdmin)
				.orElseGet(() -> create(new CreateRestaurantRequest(
						0,
						"vi",
						new RestaurantContentRequest(
								"nha-hang",
								"Nhà hàng",
								null,
								null,
								null,
								null
						)
				)));
	}

	@Transactional(readOnly = true)
	public AdminRestaurantResponse get(UUID id) {
		return toAdmin(requireRestaurant(id));
	}

	@Transactional
	public AdminRestaurantResponse create(CreateRestaurantRequest request) {
		String locale = request.locale() == null || request.locale().isBlank() ? "vi" : request.locale();
		validateLocale(locale);

		Restaurant restaurant = new Restaurant();
		restaurant.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
		restaurant.setActive(true);
		restaurantRepository.save(restaurant);

		if (request.content() != null) {
			upsertContentInternal(restaurant, locale, request.content());
		} else {
			RestaurantContent content = new RestaurantContent();
			content.setRestaurant(restaurant);
			content.setLocale(locale);
			content.setDocumentDraft(DocumentValidator.EMPTY_DOCUMENT);
			contentRepository.save(content);
		}
		return toAdmin(restaurant);
	}

	@Transactional
	public AdminRestaurantResponse update(UUID id, UpdateRestaurantRequest request) {
		Restaurant restaurant = requireRestaurant(id);
		if (request.displayOrder() != null) {
			restaurant.setDisplayOrder(request.displayOrder());
		}
		if (request.active() != null) {
			restaurant.setActive(request.active());
		}
		if (request.coverImageUrl() != null) {
			restaurant.setCoverImageUrl(blankToNull(request.coverImageUrl()));
		}
		restaurantRepository.save(restaurant);
		return toAdmin(restaurant);
	}

	@Transactional
	public void deactivate(UUID id) {
		Restaurant restaurant = requireRestaurant(id);
		restaurant.setActive(false);
		restaurantRepository.save(restaurant);
		for (RestaurantContent content : contentRepository.findByRestaurantId(id)) {
			content.setPublished(false);
			contentRepository.save(content);
		}
	}

	@Transactional
	public AdminRestaurantResponse upsertContent(UUID id, String locale, RestaurantContentRequest request) {
		validateLocale(locale);
		Restaurant restaurant = requireRestaurant(id);
		upsertContentInternal(restaurant, locale, request);
		return toAdmin(restaurant);
	}

	@Transactional
	public AdminRestaurantResponse publish(UUID id, String locale) {
		validateLocale(locale);
		Restaurant restaurant = requireRestaurant(id);
		RestaurantContent content = contentRepository.findByRestaurantIdAndLocale(id, locale)
				.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "CONTENT_MISSING", "Content for locale is missing"));
		if (!restaurant.isActive()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "RESTAURANT_INACTIVE", "Cannot publish inactive restaurant");
		}
		if (blankToNull(content.getTitle()) == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "TITLE_REQUIRED", "Title is required to publish");
		}
		String slug = blankToNull(content.getSlug());
		if (slug == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "SLUG_REQUIRED", "Slug is required to publish");
		}
		if (!SLUG_PATTERN.matcher(slug).matches()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "SLUG_INVALID", "Slug must be lowercase kebab-case");
		}
		if (contentRepository.existsByLocaleAndSlugAndRestaurantIdNot(locale, slug, id)) {
			throw new ApiException(HttpStatus.CONFLICT, "SLUG_TAKEN", "Slug already used for this locale");
		}
		documentValidator.validateOrThrow(content.getDocumentDraft());
		content.setDocumentPublished(content.getDocumentDraft());
		content.setPublished(true);
		content.setPublishedAt(Instant.now());
		contentRepository.save(content);
		return toAdmin(restaurant);
	}

	@Transactional
	public AdminRestaurantResponse unpublish(UUID id, String locale) {
		validateLocale(locale);
		Restaurant restaurant = requireRestaurant(id);
		RestaurantContent content = contentRepository.findByRestaurantIdAndLocale(id, locale)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_MISSING", "Content for locale is missing"));
		content.setPublished(false);
		contentRepository.save(content);
		return toAdmin(restaurant);
	}

	@Transactional
	public MediaUploadResponse uploadMedia(UUID id, MultipartFile file) {
		requireRestaurant(id);
		ImageStorageService.StoredFile stored = imageStorageService.store("restaurants", id, file);
		return new MediaUploadResponse(stored.publicUrl(), stored.storageKey());
	}

	@Transactional(readOnly = true)
	public PreviewTokenResponse createPreviewToken(UUID id, String locale) {
		validateLocale(locale);
		requireRestaurant(id);
		contentRepository.findByRestaurantIdAndLocale(id, locale)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_MISSING", "Content for locale is missing"));
		String token = previewTokenService.issue(id, locale);
		return new PreviewTokenResponse(token, RestaurantPreviewTokenService.TTL_SECONDS);
	}

	private void upsertContentInternal(Restaurant restaurant, String locale, RestaurantContentRequest request) {
		RestaurantContent content = contentRepository.findByRestaurantIdAndLocale(restaurant.getId(), locale)
				.orElseGet(() -> {
					RestaurantContent created = new RestaurantContent();
					created.setRestaurant(restaurant);
					created.setLocale(locale);
					created.setDocumentDraft(DocumentValidator.EMPTY_DOCUMENT);
					return created;
				});
		if (request.slug() != null) {
			String slug = blankToNull(request.slug());
			if (slug != null) {
				slug = slug.trim().toLowerCase(Locale.ROOT);
				if (!SLUG_PATTERN.matcher(slug).matches()) {
					throw new ApiException(HttpStatus.BAD_REQUEST, "SLUG_INVALID", "Slug must be lowercase kebab-case");
				}
				if (contentRepository.existsByLocaleAndSlugAndRestaurantIdNot(locale, slug, restaurant.getId())) {
					throw new ApiException(HttpStatus.CONFLICT, "SLUG_TAKEN", "Slug already used for this locale");
				}
			}
			content.setSlug(slug);
		}
		if (request.title() != null) {
			content.setTitle(blankToNull(request.title()));
		}
		if (request.shortDescription() != null) {
			content.setShortDescription(blankToNull(request.shortDescription()));
		}
		if (request.seoTitle() != null) {
			content.setSeoTitle(blankToNull(request.seoTitle()));
		}
		if (request.seoDescription() != null) {
			content.setSeoDescription(blankToNull(request.seoDescription()));
		}
		if (request.documentDraft() != null) {
			String json;
			try {
				json = objectMapper.writeValueAsString(request.documentDraft());
				// Soft parse check only; full block rules run on publish.
				objectMapper.readTree(json);
			} catch (Exception ex) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "DOCUMENT_PARSE", "Invalid documentDraft");
			}
			content.setDocumentDraft(json);
		}
		contentRepository.save(content);
	}

	private AdminRestaurantResponse toAdmin(Restaurant restaurant) {
		List<AdminRestaurantResponse.Content> contents = contentRepository.findByRestaurantId(restaurant.getId()).stream()
				.map(c -> new AdminRestaurantResponse.Content(
						c.getLocale(),
						c.getSlug(),
						c.getTitle(),
						c.getShortDescription(),
						c.getSeoTitle(),
						c.getSeoDescription(),
						readJson(c.getDocumentDraft()),
						readJson(c.getDocumentPublished()),
						c.isPublished(),
						cmsStatus(c)
				))
				.toList();
		return new AdminRestaurantResponse(
				restaurant.getId(),
				restaurant.getDisplayOrder(),
				restaurant.isActive(),
				restaurant.getCoverImageUrl(),
				contents
		);
	}

	private String cmsStatus(RestaurantContent content) {
		if (blankToNull(content.getTitle()) == null && blankToNull(content.getSlug()) == null) {
			return "Missing";
		}
		return content.isPublished() ? "Published" : "Draft";
	}

	private Object readJson(String raw) {
		if (raw == null || raw.isBlank()) {
			return objectMapper.createObjectNode();
		}
		try {
			return objectMapper.readValue(raw, Object.class);
		} catch (Exception ex) {
			return objectMapper.createObjectNode();
		}
	}

	private Restaurant requireRestaurant(UUID id) {
		return restaurantRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Restaurant not found"));
	}

	private void validateLocale(String locale) {
		if (!"vi".equals(locale) && !"en".equals(locale)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "LOCALE_INVALID", "Locale must be vi or en");
		}
	}

	private String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
