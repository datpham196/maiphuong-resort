package com.maiphuong.nuss.rooms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.rooms.entity.RoomContent;
import com.maiphuong.nuss.rooms.entity.RoomType;
import com.maiphuong.nuss.rooms.repository.RoomContentRepository;
import com.maiphuong.nuss.rooms.repository.RoomTypeRepository;
import com.maiphuong.nuss.rooms.seed.RoomContentSeedModels.SeedCatalog;
import com.maiphuong.nuss.rooms.seed.RoomContentSeedModels.SeedLocale;
import com.maiphuong.nuss.rooms.seed.RoomContentSeedModels.SeedRoom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class RoomContentSeedService {

	private static final Logger log = LoggerFactory.getLogger(RoomContentSeedService.class);
	private static final String SEED_RESOURCE = "room-content-seeds.json";

	private final RoomTypeRepository roomTypeRepository;
	private final RoomContentRepository roomContentRepository;
	private final ObjectMapper objectMapper;

	private volatile SeedCatalog catalog;

	public RoomContentSeedService(
			RoomTypeRepository roomTypeRepository,
			RoomContentRepository roomContentRepository,
			ObjectMapper objectMapper
	) {
		this.roomTypeRepository = roomTypeRepository;
		this.roomContentRepository = roomContentRepository;
		this.objectMapper = objectMapper;
	}

	/**
	 * Upserts seeded marketing text for known OnePMS external IDs.
	 * Creates missing locale rows; refreshes seed text fields; publishes when title+slug exist.
	 * Does not touch images.
	 */
	@Transactional
	public int applySeeds() {
		SeedCatalog seeds = loadCatalog();
		if (seeds.isEmpty()) {
			return 0;
		}

		int touched = 0;
		for (Map.Entry<String, SeedRoom> entry : seeds.entrySet()) {
			String externalId = entry.getKey();
			SeedRoom seed = entry.getValue();
			RoomType roomType = roomTypeRepository.findByExternalId(externalId).orElse(null);
			if (roomType == null) {
				log.debug("Skip room content seed: room type {} not synced yet", externalId);
				continue;
			}
			if (seed.vi() != null) {
				touched += upsertLocale(roomType, "vi", seed.vi(), seed.displayOrder()) ? 1 : 0;
			}
			if (seed.en() != null) {
				touched += upsertLocale(roomType, "en", seed.en(), seed.displayOrder()) ? 1 : 0;
			}
		}
		if (touched > 0) {
			log.info("Applied room content seeds for {} locale row(s)", touched);
		}
		return touched;
	}

	@Transactional
	public void applySeedIfPresent(RoomType roomType) {
		if (roomType == null || roomType.getExternalId() == null) {
			return;
		}
		SeedRoom seed = loadCatalog().get(roomType.getExternalId());
		if (seed == null) {
			return;
		}
		if (seed.vi() != null) {
			upsertLocale(roomType, "vi", seed.vi(), seed.displayOrder());
		}
		if (seed.en() != null) {
			upsertLocale(roomType, "en", seed.en(), seed.displayOrder());
		}
	}

	private boolean upsertLocale(RoomType roomType, String locale, SeedLocale seed, Integer displayOrder) {
		if (seed == null || isBlank(seed.title()) || isBlank(seed.slug())) {
			return false;
		}

		String slug = normalizeSlug(seed.slug());
		if (slug == null) {
			return false;
		}
		if (roomContentRepository.existsByLocaleAndSlugAndRoomTypeIdNot(locale, slug, roomType.getId())) {
			log.warn("Skip seed for {} / {}: slug '{}' already used by another room", roomType.getExternalId(), locale, slug);
			return false;
		}

		RoomContent content = roomContentRepository.findByRoomTypeIdAndLocale(roomType.getId(), locale)
				.orElseGet(() -> {
					RoomContent created = new RoomContent();
					created.setRoomType(roomType);
					created.setLocale(locale);
					return created;
				});

		content.setSlug(slug);
		content.setTitle(seed.title().trim());
		content.setShortDescription(blankToNull(seed.shortDescription()));
		content.setDescription(blankToNull(seed.description()));
		content.setAmenities(writeAmenities(seed.amenities()));
		content.setSeoTitle(seed.title().trim());
		content.setSeoDescription(blankToNull(seed.shortDescription()));
		if (displayOrder != null) {
			content.setDisplayOrder(displayOrder);
		}
		if (roomType.isActive()) {
			content.setPublished(true);
		}
		roomContentRepository.save(content);
		return true;
	}

	private SeedCatalog loadCatalog() {
		SeedCatalog cached = catalog;
		if (cached != null) {
			return cached;
		}
		synchronized (this) {
			if (catalog != null) {
				return catalog;
			}
			try (InputStream in = new ClassPathResource(SEED_RESOURCE).getInputStream()) {
				catalog = objectMapper.readValue(in, SeedCatalog.class);
			} catch (Exception ex) {
				log.warn("Could not load {}: {}", SEED_RESOURCE, ex.getMessage());
				catalog = new SeedCatalog();
			}
			return catalog;
		}
	}

	private String writeAmenities(List<String> amenities) {
		try {
			return objectMapper.writeValueAsString(amenities == null ? List.of() : amenities);
		} catch (Exception ex) {
			return "[]";
		}
	}

	private static String normalizeSlug(String value) {
		if (isBlank(value)) {
			return null;
		}
		return value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
	}

	private static String blankToNull(String value) {
		return isBlank(value) ? null : value.trim();
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
