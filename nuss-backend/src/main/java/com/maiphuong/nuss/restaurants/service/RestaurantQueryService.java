package com.maiphuong.nuss.restaurants.service;

import com.maiphuong.nuss.restaurants.dto.PublicRestaurantResponse;
import com.maiphuong.nuss.restaurants.dto.RestaurantImageResponse;
import com.maiphuong.nuss.restaurants.entity.RestaurantContent;
import com.maiphuong.nuss.restaurants.entity.RestaurantImage;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuCategory;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuCategoryContent;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuItem;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuItemContent;
import com.maiphuong.nuss.restaurants.repository.RestaurantContentRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantImageRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuCategoryContentRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuCategoryRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuItemContentRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuItemRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RestaurantQueryService {

	private final RestaurantContentRepository contentRepository;
	private final RestaurantImageRepository imageRepository;
	private final RestaurantMenuCategoryRepository categoryRepository;
	private final RestaurantMenuCategoryContentRepository categoryContentRepository;
	private final RestaurantMenuItemRepository itemRepository;
	private final RestaurantMenuItemContentRepository itemContentRepository;

	public RestaurantQueryService(
			RestaurantContentRepository contentRepository,
			RestaurantImageRepository imageRepository,
			RestaurantMenuCategoryRepository categoryRepository,
			RestaurantMenuCategoryContentRepository categoryContentRepository,
			RestaurantMenuItemRepository itemRepository,
			RestaurantMenuItemContentRepository itemContentRepository
	) {
		this.contentRepository = contentRepository;
		this.imageRepository = imageRepository;
		this.categoryRepository = categoryRepository;
		this.categoryContentRepository = categoryContentRepository;
		this.itemRepository = itemRepository;
		this.itemContentRepository = itemContentRepository;
	}

	@Transactional(readOnly = true)
	public List<PublicRestaurantResponse> list(String locale) {
		String normalized = normalizeLocale(locale);
		return contentRepository.findPublishedByLocale(normalized).stream()
				.map(c -> toPublic(c, normalized))
				.toList();
	}

	@Transactional(readOnly = true)
	public PublicRestaurantResponse getBySlug(String slug, String locale) {
		String normalized = normalizeLocale(locale);
		RestaurantContent content = contentRepository.findPublishedBySlugAndLocale(slug, normalized)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Restaurant not found"));
		return toPublic(content, normalized);
	}

	private PublicRestaurantResponse toPublic(RestaurantContent content, String locale) {
		UUID restaurantId = content.getRestaurant().getId();
		List<RestaurantImage> images = imageRepository.findByRestaurantIdOrderByRoleAscDisplayOrderAsc(restaurantId);
		List<RestaurantImageResponse> slides = images.stream()
				.filter(img -> "slide".equals(img.getRole()))
				.map(this::toImage)
				.toList();
		RestaurantImageResponse mainImage = images.stream()
				.filter(img -> "main".equals(img.getRole()))
				.findFirst()
				.map(this::toImage)
				.orElse(null);
		RestaurantImageResponse signatureImage = images.stream()
				.filter(img -> "signature".equals(img.getRole()))
				.findFirst()
				.map(this::toImage)
				.orElse(null);
		List<RestaurantImageResponse> menuImages = images.stream()
				.filter(img -> "menu".equals(img.getRole()))
				.map(this::toImage)
				.toList();

		List<PublicRestaurantResponse.MenuCategory> menu = new ArrayList<>();
		for (RestaurantMenuCategory category : categoryRepository.findByRestaurantIdAndActiveTrueOrderByDisplayOrderAsc(restaurantId)) {
			String categoryName = categoryContentRepository.findByCategoryIdAndLocale(category.getId(), locale)
					.map(RestaurantMenuCategoryContent::getName)
					.orElse(category.getCode());
			List<PublicRestaurantResponse.MenuItem> items = new ArrayList<>();
			for (RestaurantMenuItem item : itemRepository.findByCategoryIdOrderByDisplayOrderAsc(category.getId())) {
				if (!item.isActive()) {
					continue;
				}
				RestaurantMenuItemContent itemContent = itemContentRepository
						.findByItemIdAndLocale(item.getId(), locale)
						.orElse(null);
				if (itemContent == null) {
					continue;
				}
				items.add(new PublicRestaurantResponse.MenuItem(
						item.getId(),
						itemContent.getName(),
						itemContent.getDescription(),
						item.getPriceAmount(),
						item.getPriceCurrency(),
						item.getPriceLabel()
				));
			}
			menu.add(new PublicRestaurantResponse.MenuCategory(
					category.getId(),
					category.getCode(),
					categoryName,
					items
			));
		}

		return new PublicRestaurantResponse(
				restaurantId,
				content.getRestaurant().getKind(),
				content.getSlug(),
				content.getTitle(),
				content.getShortDescription(),
				content.getSeoTitle(),
				content.getSeoDescription(),
				content.getHeroSubtitle(),
				content.getIntroEyebrow(),
				content.getIntroHeading(),
				content.getIntroBody(),
				content.getIntroBodySecondary(),
				content.getMenuSectionEyebrow(),
				content.getMenuSectionHeading(),
				content.getMenuSectionLead(),
				content.getRestaurant().getCoverImageUrl(),
				content.getRestaurant().getDisplayOrder(),
				slides,
				mainImage,
				signatureImage,
				menuImages,
				menu
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
