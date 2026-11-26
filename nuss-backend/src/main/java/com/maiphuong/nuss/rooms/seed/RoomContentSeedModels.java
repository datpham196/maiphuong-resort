package com.maiphuong.nuss.rooms.seed;

import java.util.LinkedHashMap;
import java.util.List;

/** Jackson DTOs for classpath room-content-seeds.json (keyed by OnePMS external_id). */
public final class RoomContentSeedModels {

	private RoomContentSeedModels() {
	}

	public record SeedRoom(
			Integer displayOrder,
			SeedLocale vi,
			SeedLocale en
	) {
	}

	public record SeedLocale(
			String slug,
			String title,
			String shortDescription,
			String description,
			List<String> amenities
	) {
	}

	public static final class SeedCatalog extends LinkedHashMap<String, SeedRoom> {
	}
}
