package com.maiphuong.nuss.restaurants.service;

import com.maiphuong.nuss.restaurants.dto.MenuCategoryResponse;
import com.maiphuong.nuss.restaurants.dto.MenuItemRequest;
import com.maiphuong.nuss.restaurants.dto.MenuItemResponse;
import com.maiphuong.nuss.restaurants.entity.Restaurant;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuCategory;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuCategoryContent;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuItem;
import com.maiphuong.nuss.restaurants.entity.RestaurantMenuItemContent;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuCategoryContentRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuCategoryRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuItemContentRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantMenuItemRepository;
import com.maiphuong.nuss.restaurants.repository.RestaurantRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RestaurantMenuAdminService {

	private final RestaurantRepository restaurantRepository;
	private final RestaurantMenuCategoryRepository categoryRepository;
	private final RestaurantMenuCategoryContentRepository categoryContentRepository;
	private final RestaurantMenuItemRepository itemRepository;
	private final RestaurantMenuItemContentRepository itemContentRepository;

	public RestaurantMenuAdminService(
			RestaurantRepository restaurantRepository,
			RestaurantMenuCategoryRepository categoryRepository,
			RestaurantMenuCategoryContentRepository categoryContentRepository,
			RestaurantMenuItemRepository itemRepository,
			RestaurantMenuItemContentRepository itemContentRepository
	) {
		this.restaurantRepository = restaurantRepository;
		this.categoryRepository = categoryRepository;
		this.categoryContentRepository = categoryContentRepository;
		this.itemRepository = itemRepository;
		this.itemContentRepository = itemContentRepository;
	}

	@Transactional(readOnly = true)
	public List<MenuCategoryResponse> listCategories(UUID restaurantId) {
		requireRestaurant(restaurantId);
		return categoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId).stream()
				.map(this::toCategory)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<MenuItemResponse> listItems(UUID restaurantId) {
		requireRestaurant(restaurantId);
		return itemRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId).stream()
				.map(this::toItem)
				.toList();
	}

	@Transactional
	public MenuItemResponse createItem(UUID restaurantId, MenuItemRequest request) {
		Restaurant restaurant = requireRestaurant(restaurantId);
		RestaurantMenuCategory category = requireCategory(restaurantId, request.categoryId());
		if (blankToNull(request.nameVi()) == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "NAME_REQUIRED", "Vietnamese dish name is required");
		}
		RestaurantMenuItem item = new RestaurantMenuItem();
		item.setRestaurant(restaurant);
		item.setCategory(category);
		applyItemFields(item, request);
		itemRepository.save(item);
		upsertItemContent(item, "vi", request.nameVi(), request.descriptionVi());
		upsertItemContent(item, "en", request.nameEn() != null ? request.nameEn() : request.nameVi(), request.descriptionEn());
		return toItem(item);
	}

	@Transactional
	public MenuItemResponse updateItem(UUID restaurantId, UUID itemId, MenuItemRequest request) {
		RestaurantMenuItem item = itemRepository.findByIdAndRestaurantId(itemId, restaurantId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Menu item not found"));
		if (request.categoryId() != null) {
			item.setCategory(requireCategory(restaurantId, request.categoryId()));
		}
		applyItemFields(item, request);
		itemRepository.save(item);
		if (request.nameVi() != null || request.descriptionVi() != null) {
			upsertItemContent(item, "vi", request.nameVi(), request.descriptionVi());
		}
		if (request.nameEn() != null || request.descriptionEn() != null) {
			upsertItemContent(item, "en", request.nameEn(), request.descriptionEn());
		}
		return toItem(item);
	}

	@Transactional
	public void deleteItem(UUID restaurantId, UUID itemId) {
		RestaurantMenuItem item = itemRepository.findByIdAndRestaurantId(itemId, restaurantId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Menu item not found"));
		itemRepository.delete(item);
	}

	private void applyItemFields(RestaurantMenuItem item, MenuItemRequest request) {
		if (request.priceAmount() != null) {
			item.setPriceAmount(request.priceAmount());
		}
		if (request.priceCurrency() != null && !request.priceCurrency().isBlank()) {
			item.setPriceCurrency(request.priceCurrency().trim().toUpperCase());
		}
		if (request.priceLabel() != null) {
			item.setPriceLabel(blankToNull(request.priceLabel()));
		}
		if (request.displayOrder() != null) {
			item.setDisplayOrder(request.displayOrder());
		}
		if (request.active() != null) {
			item.setActive(request.active());
		}
	}

	private void upsertItemContent(RestaurantMenuItem item, String locale, String name, String description) {
		RestaurantMenuItemContent content = itemContentRepository.findByItemIdAndLocale(item.getId(), locale)
				.orElseGet(() -> {
					RestaurantMenuItemContent created = new RestaurantMenuItemContent();
					created.setItem(item);
					created.setLocale(locale);
					return created;
				});
		if (name != null) {
			String cleaned = blankToNull(name);
			if (cleaned == null && "vi".equals(locale)) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "NAME_REQUIRED", "Vietnamese dish name is required");
			}
			if (cleaned != null) {
				content.setName(cleaned);
			}
		}
		if (description != null) {
			content.setDescription(blankToNull(description));
		}
		if (blankToNull(content.getName()) == null) {
			content.setName("Untitled");
		}
		itemContentRepository.save(content);
	}

	private MenuCategoryResponse toCategory(RestaurantMenuCategory category) {
		List<MenuCategoryResponse.LocaleName> names = categoryContentRepository.findByCategoryId(category.getId()).stream()
				.map(c -> new MenuCategoryResponse.LocaleName(c.getLocale(), c.getName()))
				.toList();
		return new MenuCategoryResponse(
				category.getId(),
				category.getCode(),
				category.getDisplayOrder(),
				category.isActive(),
				names
		);
	}

	private MenuItemResponse toItem(RestaurantMenuItem item) {
		List<MenuItemResponse.LocaleContent> contents = itemContentRepository.findByItemId(item.getId()).stream()
				.map(c -> new MenuItemResponse.LocaleContent(c.getLocale(), c.getName(), c.getDescription()))
				.toList();
		return new MenuItemResponse(
				item.getId(),
				item.getCategory().getId(),
				item.getCategory().getCode(),
				item.getPriceAmount(),
				item.getPriceCurrency(),
				item.getPriceLabel(),
				item.getDisplayOrder(),
				item.isActive(),
				contents
		);
	}

	private Restaurant requireRestaurant(UUID id) {
		return restaurantRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Restaurant not found"));
	}

	private RestaurantMenuCategory requireCategory(UUID restaurantId, UUID categoryId) {
		if (categoryId == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "CATEGORY_REQUIRED", "Category is required");
		}
		return categoryRepository.findByIdAndRestaurantId(categoryId, restaurantId)
				.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "CATEGORY_NOT_FOUND", "Category not found"));
	}

	private String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
