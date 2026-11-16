package com.maiphuong.nuss.gallery.controller;

import com.maiphuong.nuss.gallery.dto.GalleryImageResponse;
import com.maiphuong.nuss.gallery.service.GalleryQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/gallery")
public class PublicGalleryController {

	private final GalleryQueryService galleryQueryService;

	public PublicGalleryController(GalleryQueryService galleryQueryService) {
		this.galleryQueryService = galleryQueryService;
	}

	@GetMapping
	public List<GalleryImageResponse> list(@RequestParam(defaultValue = "vi") String locale) {
		return galleryQueryService.list(locale);
	}
}
