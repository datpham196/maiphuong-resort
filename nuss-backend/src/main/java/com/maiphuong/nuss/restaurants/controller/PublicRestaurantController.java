package com.maiphuong.nuss.restaurants.controller;

import com.maiphuong.nuss.restaurants.dto.PublicRestaurantResponse;
import com.maiphuong.nuss.restaurants.service.RestaurantPreviewTokenService;
import com.maiphuong.nuss.restaurants.service.RestaurantQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class PublicRestaurantController {

	private final RestaurantQueryService restaurantQueryService;
	private final RestaurantPreviewTokenService previewTokenService;

	public PublicRestaurantController(
			RestaurantQueryService restaurantQueryService,
			RestaurantPreviewTokenService previewTokenService
	) {
		this.restaurantQueryService = restaurantQueryService;
		this.previewTokenService = previewTokenService;
	}

	@GetMapping
	public List<PublicRestaurantResponse> list(@RequestParam(defaultValue = "vi") String locale) {
		return restaurantQueryService.list(locale);
	}

	@GetMapping("/preview")
	public PublicRestaurantResponse preview(@RequestParam String token) {
		return restaurantQueryService.getPreview(token, previewTokenService);
	}

	@GetMapping("/{slug}")
	public PublicRestaurantResponse detail(
			@PathVariable String slug,
			@RequestParam(defaultValue = "vi") String locale
	) {
		return restaurantQueryService.getBySlug(slug, locale);
	}
}
