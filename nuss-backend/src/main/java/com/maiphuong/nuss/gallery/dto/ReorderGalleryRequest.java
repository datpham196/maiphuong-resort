package com.maiphuong.nuss.gallery.dto;

import java.util.List;
import java.util.UUID;

public record ReorderGalleryRequest(
		List<UUID> ids
) {
}
