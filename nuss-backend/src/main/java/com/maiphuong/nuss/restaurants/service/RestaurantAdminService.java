package com.maiphuong.nuss.restaurants.service;

import com.maiphuong.nuss.pagebuilder.DocumentValidator;
import com.maiphuong.nuss.restaurants.dto.AdminRestaurantResponse;
import com.maiphuong.nuss.restaurants.dto.CreateRestaurantRequest;
import com.maiphuong.nuss.restaurants.dto.RestaurantContentRequest;
import com.maiphuong.nuss.restaurants.dto.RestaurantImageResponse;
import com.maiphuong.nuss.restaurants.dto.UpdateRestaurantRequest;
import com.maiphuong.nuss.restaurants.entity.Restaurant;
import com.maiphuong.nuss.restaurants.entity.RestaurantContent;
import com.maiphuong.nuss.restaurants.entity.RestaurantImage;
import com.maiphuong.nuss.restaurants.repository.RestaurantContentRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantImageRepository;
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
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class RestaurantAdminService {

	private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");
	private static final Set<String> IMAGE_ROLES = Set.of("slide", "main", "signature", "menu");
	private static final Set<String> SINGLE_ROLES = Set.of("main", "signature");

	private final RestaurantRepository restaurantRepository;
	private final RestaurantContentRepository contentRepository;
	private final RestaurantImageRepository imageRepository;
	private final ImageStorageService imageStorageService;

	public RestaurantAdminService(
			RestaurantRepository restaurantRepository,
			RestaurantContentRepository contentRepository,
			RestaurantImageRepository imageRepository,
			ImageStorageService imageStorageService
	) {
		this.restaurantRepository = restaurantRepository;
		this.contentRepository = contentRepository;
		this.imageRepository = imageRepository;
		this.imageStorageService = imageStorageService;
	}

	@Transactional(readOnly = true)
	public List<AdminRestaurantResponse> list() {
		return restaurantRepository.findAllByOrderByDisplayOrderAsc().stream()
				.map(this::toAdmin)
				.toList();
	}

	@Transactional
	public AdminRestaurantResponse getPrimary(String kind) {
		String normalizedKind = normalizeKind(kind);
		return restaurantRepository.findByKindOrderByDisplayOrderAsc(normalizedKind).stream()
				.findFirst()
				.map(this::toAdmin)
				.orElseGet(() -> create(defaultCreateRequest(normalizedKind)));
	}

	@Transactional(readOnly = true)
	public AdminRestaurantResponse get(UUID id) {
		return toAdmin(requireRestaurant(id));
	}

	@Transactional
	public AdminRestaurantResponse create(CreateRestaurantRequest request) {
		String locale = request.locale() == null || request.locale().isBlank() ? "vi" : request.locale();
		validateLocale(locale);
		String kind = normalizeKind(request.kind());

		Restaurant restaurant = new Restaurant();
		restaurant.setKind(kind);
		restaurant.setDisplayOrder(request.displayOrder() == null ? defaultDisplayOrder(kind) : request.displayOrder());
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
	public RestaurantImageResponse uploadImage(UUID id, String role, MultipartFile file, String altText) {
		String normalizedRole = normalizeImageRole(role);
		Restaurant restaurant = requireRestaurant(id);
		if (SINGLE_ROLES.contains(normalizedRole)) {
			List<RestaurantImage> existing = imageRepository.findByRestaurantIdAndRoleOrderByDisplayOrderAsc(id, normalizedRole);
			for (RestaurantImage image : existing) {
				imageRepository.delete(image);
			}
		}
		ImageStorageService.StoredFile stored = imageStorageService.store("restaurants", id, file);
		RestaurantImage image = new RestaurantImage();
		image.setRestaurant(restaurant);
		image.setRole(normalizedRole);
		image.setImageUrl(stored.publicUrl());
		image.setStorageKey(stored.storageKey());
		image.setAltText(blankToNull(altText));
		int order = (int) imageRepository.countByRestaurantIdAndRole(id, normalizedRole);
		image.setDisplayOrder(order);
		imageRepository.save(image);
		if ("slide".equals(normalizedRole) && blankToNull(restaurant.getCoverImageUrl()) == null) {
			restaurant.setCoverImageUrl(stored.publicUrl());
			restaurantRepository.save(restaurant);
		}
		return toImage(image);
	}

	@Transactional
	public void deleteImage(UUID id, UUID imageId) {
		RestaurantImage image = imageRepository.findByIdAndRestaurantId(imageId, id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "IMAGE_NOT_FOUND", "Image not found"));
		imageRepository.delete(image);
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
		if (request.heroSubtitle() != null) {
			content.setHeroSubtitle(blankToNull(request.heroSubtitle()));
		}
		if (request.introEyebrow() != null) {
			content.setIntroEyebrow(blankToNull(request.introEyebrow()));
		}
		if (request.introHeading() != null) {
			content.setIntroHeading(blankToNull(request.introHeading()));
		}
		if (request.introBody() != null) {
			content.setIntroBody(blankToNull(request.introBody()));
		}
		if (request.introBodySecondary() != null) {
			content.setIntroBodySecondary(blankToNull(request.introBodySecondary()));
		}
		if (request.menuSectionEyebrow() != null) {
			content.setMenuSectionEyebrow(blankToNull(request.menuSectionEyebrow()));
		}
		if (request.menuSectionHeading() != null) {
			content.setMenuSectionHeading(blankToNull(request.menuSectionHeading()));
		}
		if (request.menuSectionLead() != null) {
			content.setMenuSectionLead(blankToNull(request.menuSectionLead()));
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
						c.getHeroSubtitle(),
						c.getIntroEyebrow(),
						c.getIntroHeading(),
						c.getIntroBody(),
						c.getIntroBodySecondary(),
						c.getMenuSectionEyebrow(),
						c.getMenuSectionHeading(),
						c.getMenuSectionLead(),
						c.isPublished(),
						cmsStatus(c)
				))
				.toList();
		List<RestaurantImageResponse> images = imageRepository
				.findByRestaurantIdOrderByRoleAscDisplayOrderAsc(restaurant.getId())
				.stream()
				.map(this::toImage)
				.toList();
		return new AdminRestaurantResponse(
				restaurant.getId(),
				restaurant.getKind(),
				restaurant.getDisplayOrder(),
				restaurant.isActive(),
				restaurant.getCoverImageUrl(),
				contents,
				images
		);
	}

	private RestaurantImageResponse toImage(RestaurantImage image) {
		return new RestaurantImageResponse(
				image.getId(),
				image.getRole(),
				image.getImageUrl(),
				image.getAltText(),
				image.getDisplayOrder()
		);
	}

	private CreateRestaurantRequest defaultCreateRequest(String kind) {
		if ("bar".equals(kind)) {
			return new CreateRestaurantRequest(
					defaultDisplayOrder(kind),
					"vi",
					kind,
					new RestaurantContentRequest(
							"bar", "Bar", null, null, null,
							null, null, null, null, null, null, null, null
					)
			);
		}
		return new CreateRestaurantRequest(
				defaultDisplayOrder(kind),
				"vi",
				kind,
				new RestaurantContentRequest(
						"nha-hang", "Nhà hàng", null, null, null,
						null, null, null, null, null, null, null, null
				)
		);
	}

	private int defaultDisplayOrder(String kind) {
		return "bar".equals(kind) ? 2 : 1;
	}

	private String normalizeKind(String kind) {
		if (kind == null || kind.isBlank()) {
			return "restaurant";
		}
		String normalized = kind.trim().toLowerCase(Locale.ROOT);
		if (!"restaurant".equals(normalized) && !"bar".equals(normalized)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "KIND_INVALID", "Kind must be restaurant or bar");
		}
		return normalized;
	}

	private String normalizeImageRole(String role) {
		if (role == null || role.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "ROLE_REQUIRED", "Image role is required");
		}
		String normalized = role.trim().toLowerCase(Locale.ROOT);
		if (!IMAGE_ROLES.contains(normalized)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "ROLE_INVALID", "Image role must be slide, main, signature or menu");
		}
		return normalized;
	}

	private String cmsStatus(RestaurantContent content) {
		if (blankToNull(content.getTitle()) == null && blankToNull(content.getSlug()) == null) {
			return "Missing";
		}
		return content.isPublished() ? "Published" : "Draft";
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
