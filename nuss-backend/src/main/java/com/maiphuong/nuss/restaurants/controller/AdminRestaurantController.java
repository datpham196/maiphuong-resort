package com.maiphuong.nuss.restaurants.controller;

import com.maiphuong.nuss.restaurants.dto.AdminRestaurantResponse;
import com.maiphuong.nuss.restaurants.dto.CreateRestaurantRequest;
import com.maiphuong.nuss.restaurants.dto.MenuCategoryResponse;
import com.maiphuong.nuss.restaurants.dto.MenuItemRequest;
import com.maiphuong.nuss.restaurants.dto.MenuItemResponse;
import com.maiphuong.nuss.restaurants.dto.RestaurantContentRequest;
import com.maiphuong.nuss.restaurants.dto.RestaurantImageResponse;
import com.maiphuong.nuss.restaurants.dto.UpdateRestaurantRequest;
import com.maiphuong.nuss.restaurants.service.RestaurantAdminService;
import com.maiphuong.nuss.restaurants.service.RestaurantMenuAdminService;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/restaurants")
public class AdminRestaurantController {

	private final RestaurantAdminService restaurantAdminService;
	private final RestaurantMenuAdminService menuAdminService;

	public AdminRestaurantController(
			RestaurantAdminService restaurantAdminService,
			RestaurantMenuAdminService menuAdminService
	) {
		this.restaurantAdminService = restaurantAdminService;
		this.menuAdminService = menuAdminService;
	}

	@GetMapping
	public List<AdminRestaurantResponse> list() {
		return restaurantAdminService.list();
	}

	@GetMapping("/primary")
	public AdminRestaurantResponse primary(@RequestParam(defaultValue = "restaurant") String kind) {
		return restaurantAdminService.getPrimary(kind);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AdminRestaurantResponse create(@RequestBody CreateRestaurantRequest request) {
		return restaurantAdminService.create(request);
	}

	@GetMapping("/{id}")
	public AdminRestaurantResponse get(@PathVariable UUID id) {
		return restaurantAdminService.get(id);
	}

	@PutMapping("/{id}")
	public AdminRestaurantResponse update(@PathVariable UUID id, @RequestBody UpdateRestaurantRequest request) {
		return restaurantAdminService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deactivate(@PathVariable UUID id) {
		restaurantAdminService.deactivate(id);
	}

	@PutMapping("/{id}/contents/{locale}")
	public AdminRestaurantResponse upsertContent(
			@PathVariable UUID id,
			@PathVariable String locale,
			@RequestBody RestaurantContentRequest request
	) {
		return restaurantAdminService.upsertContent(id, locale, request);
	}

	@PostMapping("/{id}/contents/{locale}/publish")
	public AdminRestaurantResponse publish(@PathVariable UUID id, @PathVariable String locale) {
		return restaurantAdminService.publish(id, locale);
	}

	@PostMapping("/{id}/contents/{locale}/unpublish")
	public AdminRestaurantResponse unpublish(@PathVariable UUID id, @PathVariable String locale) {
		return restaurantAdminService.unpublish(id, locale);
	}

	@PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
	public RestaurantImageResponse uploadImage(
			@PathVariable UUID id,
			@RequestParam("role") String role,
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "altText", required = false) String altText
	) {
		return restaurantAdminService.uploadImage(id, role, file, altText);
	}

	@DeleteMapping("/{id}/images/{imageId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteImage(@PathVariable UUID id, @PathVariable UUID imageId) {
		restaurantAdminService.deleteImage(id, imageId);
	}

	@GetMapping("/{id}/menu/categories")
	public List<MenuCategoryResponse> listCategories(@PathVariable UUID id) {
		return menuAdminService.listCategories(id);
	}

	@GetMapping("/{id}/menu/items")
	public List<MenuItemResponse> listItems(@PathVariable UUID id) {
		return menuAdminService.listItems(id);
	}

	@PostMapping("/{id}/menu/items")
	@ResponseStatus(HttpStatus.CREATED)
	public MenuItemResponse createItem(@PathVariable UUID id, @RequestBody MenuItemRequest request) {
		return menuAdminService.createItem(id, request);
	}

	@PutMapping("/{id}/menu/items/{itemId}")
	public MenuItemResponse updateItem(
			@PathVariable UUID id,
			@PathVariable UUID itemId,
			@RequestBody MenuItemRequest request
	) {
		return menuAdminService.updateItem(id, itemId, request);
	}

	@DeleteMapping("/{id}/menu/items/{itemId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteItem(@PathVariable UUID id, @PathVariable UUID itemId) {
		menuAdminService.deleteItem(id, itemId);
	}
}
