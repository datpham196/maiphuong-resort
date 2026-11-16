package com.maiphuong.nuss.gallery.dto;

public record UpdateGalleryImageRequest(
		String captionVi,
		String captionEn,
		Integer displayOrder,
		Boolean active
) {
}
