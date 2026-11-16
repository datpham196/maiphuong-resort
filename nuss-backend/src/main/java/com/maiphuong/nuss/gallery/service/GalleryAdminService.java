package com.maiphuong.nuss.gallery.service;

import com.maiphuong.nuss.gallery.dto.GalleryImageResponse;
import com.maiphuong.nuss.gallery.dto.ReorderGalleryRequest;
import com.maiphuong.nuss.gallery.dto.UpdateGalleryImageRequest;
import com.maiphuong.nuss.gallery.entity.GalleryImage;
import com.maiphuong.nuss.gallery.repository.GalleryImageRepository;
import com.maiphuong.nuss.rooms.service.ImageStorageService;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GalleryAdminService {

	private final GalleryImageRepository galleryImageRepository;
	private final ImageStorageService imageStorageService;

	public GalleryAdminService(
			GalleryImageRepository galleryImageRepository,
			ImageStorageService imageStorageService
	) {
		this.galleryImageRepository = galleryImageRepository;
		this.imageStorageService = imageStorageService;
	}

	@Transactional(readOnly = true)
	public List<GalleryImageResponse> list() {
		return galleryImageRepository.findAllByOrderByDisplayOrderAscCreatedAtAsc().stream()
				.map(this::toAdmin)
				.toList();
	}

	@Transactional
	public GalleryImageResponse upload(MultipartFile file, String captionVi, String captionEn) {
		UUID imageId = UUID.randomUUID();
		ImageStorageService.StoredFile stored = imageStorageService.store("gallery", imageId, file);

		GalleryImage image = new GalleryImage();
		image.setId(imageId);
		image.setUrl(stored.publicUrl());
		image.setStorageKey(stored.storageKey());
		image.setCaptionVi(blankToNull(captionVi));
		image.setCaptionEn(blankToNull(captionEn));
		image.setDisplayOrder(galleryImageRepository.findMaxDisplayOrder() + 1);
		image.setActive(true);
		galleryImageRepository.save(image);
		return toAdmin(image);
	}

	@Transactional
	public GalleryImageResponse update(UUID id, UpdateGalleryImageRequest request) {
		GalleryImage image = requireImage(id);
		if (request.captionVi() != null) {
			image.setCaptionVi(blankToNull(request.captionVi()));
		}
		if (request.captionEn() != null) {
			image.setCaptionEn(blankToNull(request.captionEn()));
		}
		if (request.displayOrder() != null) {
			image.setDisplayOrder(request.displayOrder());
		}
		if (request.active() != null) {
			image.setActive(request.active());
		}
		galleryImageRepository.save(image);
		return toAdmin(image);
	}

	@Transactional
	public List<GalleryImageResponse> reorder(ReorderGalleryRequest request) {
		if (request == null || request.ids() == null || request.ids().isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "IDS_REQUIRED", "Image ids are required");
		}
		List<UUID> ids = request.ids();
		if (new HashSet<>(ids).size() != ids.size()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "IDS_DUPLICATE", "Duplicate image ids");
		}

		Map<UUID, GalleryImage> byId = galleryImageRepository.findAllById(ids).stream()
				.collect(Collectors.toMap(GalleryImage::getId, Function.identity()));
		if (byId.size() != ids.size()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "IDS_INVALID", "One or more images were not found");
		}

		for (int i = 0; i < ids.size(); i++) {
			GalleryImage image = byId.get(ids.get(i));
			image.setDisplayOrder(i + 1);
			galleryImageRepository.save(image);
		}
		return list();
	}

	@Transactional
	public void delete(UUID id) {
		GalleryImage image = requireImage(id);
		String storageKey = image.getStorageKey();
		galleryImageRepository.delete(image);
		imageStorageService.delete(storageKey);
	}

	private GalleryImageResponse toAdmin(GalleryImage image) {
		return new GalleryImageResponse(
				image.getId(),
				image.getUrl(),
				image.getCaptionVi(),
				image.getCaptionEn(),
				image.getCaptionVi(),
				image.getDisplayOrder(),
				image.isActive()
		);
	}

	private GalleryImage requireImage(UUID id) {
		return galleryImageRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Gallery image not found"));
	}

	private String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
