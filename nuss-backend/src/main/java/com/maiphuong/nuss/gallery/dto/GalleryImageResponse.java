package com.maiphuong.nuss.gallery.dto;

import java.util.UUID;

public record GalleryImageResponse(
		UUID id,
		String url,
		String captionVi,
		String captionEn,
		String caption,
		int displayOrder,
		boolean active
) {
}
