package com.maiphuong.nuss.gallery.controller;

import com.maiphuong.nuss.gallery.dto.GalleryImageResponse;
import com.maiphuong.nuss.gallery.dto.ReorderGalleryRequest;
import com.maiphuong.nuss.gallery.dto.UpdateGalleryImageRequest;
import com.maiphuong.nuss.gallery.service.GalleryAdminService;
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
@RequestMapping("/api/admin/gallery")
public class AdminGalleryController {

	private final GalleryAdminService galleryAdminService;

	public AdminGalleryController(GalleryAdminService galleryAdminService) {
		this.galleryAdminService = galleryAdminService;
	}

	@GetMapping
	public List<GalleryImageResponse> list() {
		return galleryAdminService.list();
	}

	@PostMapping(consumes = "multipart/form-data")
	@ResponseStatus(HttpStatus.CREATED)
	public GalleryImageResponse upload(
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "captionVi", required = false) String captionVi,
			@RequestParam(value = "captionEn", required = false) String captionEn
	) {
		return galleryAdminService.upload(file, captionVi, captionEn);
	}

	@PutMapping("/reorder")
	public List<GalleryImageResponse> reorder(@RequestBody ReorderGalleryRequest request) {
		return galleryAdminService.reorder(request);
	}

	@PutMapping("/{id}")
	public GalleryImageResponse update(@PathVariable UUID id, @RequestBody UpdateGalleryImageRequest request) {
		return galleryAdminService.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable UUID id) {
		galleryAdminService.delete(id);
	}
}
