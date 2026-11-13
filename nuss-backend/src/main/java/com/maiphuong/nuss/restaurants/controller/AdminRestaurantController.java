package com.maiphuong.nuss.restaurants.controller;

import com.maiphuong.nuss.restaurants.dto.AdminRestaurantResponse;
import com.maiphuong.nuss.restaurants.dto.CreateRestaurantRequest;
import com.maiphuong.nuss.restaurants.dto.MediaUploadResponse;
import com.maiphuong.nuss.restaurants.dto.PreviewTokenResponse;
import com.maiphuong.nuss.restaurants.dto.RestaurantContentRequest;
import com.maiphuong.nuss.restaurants.dto.UpdateRestaurantRequest;
import com.maiphuong.nuss.restaurants.service.RestaurantAdminService;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/restaurants")
public class AdminRestaurantController {

	private final RestaurantAdminService restaurantAdminService;

	public AdminRestaurantController(RestaurantAdminService restaurantAdminService) {
		this.restaurantAdminService = restaurantAdminService;
	}

	@GetMapping
	public List<AdminRestaurantResponse> list() {
		return restaurantAdminService.list();
	}

	@GetMapping("/primary")
	public AdminRestaurantResponse primary() {
		return restaurantAdminService.getPrimary();
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

	@PostMapping(value = "/{id}/media", consumes = "multipart/form-data")
	public MediaUploadResponse uploadMedia(
			@PathVariable UUID id,
			@RequestParam("file") MultipartFile file
	) {
		return restaurantAdminService.uploadMedia(id, file);
	}

	@PostMapping("/{id}/preview-token")
	public PreviewTokenResponse previewToken(
			@PathVariable UUID id,
			@RequestParam(defaultValue = "vi") String locale
	) {
		return restaurantAdminService.createPreviewToken(id, locale);
	}
}
