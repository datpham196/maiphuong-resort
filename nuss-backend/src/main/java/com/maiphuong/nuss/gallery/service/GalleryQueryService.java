package com.maiphuong.nuss.gallery.service;

import com.maiphuong.nuss.gallery.dto.GalleryImageResponse;
import com.maiphuong.nuss.gallery.entity.GalleryImage;
import com.maiphuong.nuss.gallery.repository.GalleryImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class GalleryQueryService {

	private final GalleryImageRepository galleryImageRepository;

	public GalleryQueryService(GalleryImageRepository galleryImageRepository) {
		this.galleryImageRepository = galleryImageRepository;
	}

	@Transactional(readOnly = true)
	public List<GalleryImageResponse> list(String locale) {
		String normalized = normalizeLocale(locale);
		return galleryImageRepository.findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc().stream()
				.map(image -> toPublic(image, normalized))
				.toList();
	}

	private GalleryImageResponse toPublic(GalleryImage image, String locale) {
		return new GalleryImageResponse(
				image.getId(),
				image.getUrl(),
				image.getCaptionVi(),
				image.getCaptionEn(),
				resolveCaption(image, locale),
				image.getDisplayOrder(),
				image.isActive()
		);
	}

	private String resolveCaption(GalleryImage image, String locale) {
		String preferred = "en".equals(locale) ? image.getCaptionEn() : image.getCaptionVi();
		if (preferred != null && !preferred.isBlank()) {
			return preferred.trim();
		}
		String fallback = "en".equals(locale) ? image.getCaptionVi() : image.getCaptionEn();
		if (fallback != null && !fallback.isBlank()) {
			return fallback.trim();
		}
		return null;
	}

	private String normalizeLocale(String locale) {
		if (locale == null || locale.isBlank()) {
			return "vi";
		}
		String lower = locale.trim().toLowerCase(Locale.ROOT);
		if (lower.startsWith("en")) {
			return "en";
		}
		return "vi";
	}
}
