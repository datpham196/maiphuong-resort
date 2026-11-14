package com.maiphuong.nuss.cmspages.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.cmspages.dto.PublicCmsPageResponse;
import com.maiphuong.nuss.cmspages.entity.CmsPageContent;
import com.maiphuong.nuss.cmspages.repository.CmsPageContentRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class CmsPageQueryService {

	private static final Set<String> PAGE_KEYS = Set.of("spa", "offers");

	private final CmsPageContentRepository contentRepository;
	private final ObjectMapper objectMapper;

	public CmsPageQueryService(CmsPageContentRepository contentRepository, ObjectMapper objectMapper) {
		this.contentRepository = contentRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional(readOnly = true)
	public PublicCmsPageResponse getByPageKey(String pageKey, String locale) {
		String key = normalizePageKey(pageKey);
		String normalizedLocale = normalizeLocale(locale);
		CmsPageContent content = contentRepository.findPublishedByPageKeyAndLocale(key, normalizedLocale)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Page not found"));
		return toPublic(content);
	}

	@Transactional(readOnly = true)
	public PublicCmsPageResponse getPreview(
			String pageKey,
			String token,
			CmsPagePreviewTokenService previewTokenService
	) {
		String key = normalizePageKey(pageKey);
		CmsPagePreviewTokenService.PreviewRef ref = previewTokenService.resolve(token);
		CmsPageContent content = contentRepository.findByPageIdAndLocale(ref.pageId(), ref.locale())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Page content not found"));
		if (!key.equals(content.getPage().getPageKey())) {
			throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Page not found");
		}
		return toPreview(content);
	}

	private PublicCmsPageResponse toPublic(CmsPageContent content) {
		return new PublicCmsPageResponse(
				content.getPage().getId(),
				content.getPage().getPageKey(),
				content.getSlug(),
				content.getTitle(),
				content.getShortDescription(),
				content.getSeoTitle(),
				content.getSeoDescription(),
				readJson(content.getDocumentPublished())
		);
	}

	private PublicCmsPageResponse toPreview(CmsPageContent content) {
		return new PublicCmsPageResponse(
				content.getPage().getId(),
				content.getPage().getPageKey(),
				content.getSlug(),
				content.getTitle(),
				content.getShortDescription(),
				content.getSeoTitle(),
				content.getSeoDescription(),
				readJson(content.getDocumentDraft())
		);
	}

	private Object readJson(String raw) {
		if (raw == null || raw.isBlank()) {
			return Map.of();
		}
		try {
			return objectMapper.readValue(raw, Object.class);
		} catch (Exception ex) {
			return Map.of();
		}
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

	private String normalizePageKey(String pageKey) {
		if (pageKey == null || pageKey.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "PAGE_KEY_INVALID", "Page key is required");
		}
		String normalized = pageKey.trim().toLowerCase(Locale.ROOT);
		if (!PAGE_KEYS.contains(normalized)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "PAGE_KEY_INVALID", "Page key must be spa or offers");
		}
		return normalized;
	}
}
