package com.maiphuong.nuss.cmspages.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.cmspages.dto.AdminCmsPageResponse;
import com.maiphuong.nuss.cmspages.dto.CmsPageContentRequest;
import com.maiphuong.nuss.cmspages.dto.MediaUploadResponse;
import com.maiphuong.nuss.cmspages.dto.PreviewTokenResponse;
import com.maiphuong.nuss.cmspages.dto.UpdateCmsPageRequest;
import com.maiphuong.nuss.cmspages.entity.CmsPage;
import com.maiphuong.nuss.cmspages.entity.CmsPageContent;
import com.maiphuong.nuss.cmspages.repository.CmsPageContentRepository;
import com.maiphuong.nuss.cmspages.repository.CmsPageRepository;
import com.maiphuong.nuss.pagebuilder.DocumentValidator;
import com.maiphuong.nuss.rooms.service.ImageStorageService;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CmsPageAdminService {

	private static final Set<String> PAGE_KEYS = Set.of("spa", "offers");

	private static final Map<String, String> DEFAULT_TITLES_VI = Map.of(
			"spa", "Spa",
			"offers", "Ưu đãi"
	);

	private final CmsPageRepository pageRepository;
	private final CmsPageContentRepository contentRepository;
	private final ImageStorageService imageStorageService;
	private final DocumentValidator documentValidator;
	private final CmsPagePreviewTokenService previewTokenService;
	private final ObjectMapper objectMapper;

	public CmsPageAdminService(
			CmsPageRepository pageRepository,
			CmsPageContentRepository contentRepository,
			ImageStorageService imageStorageService,
			DocumentValidator documentValidator,
			CmsPagePreviewTokenService previewTokenService,
			ObjectMapper objectMapper
	) {
		this.pageRepository = pageRepository;
		this.contentRepository = contentRepository;
		this.imageStorageService = imageStorageService;
		this.documentValidator = documentValidator;
		this.previewTokenService = previewTokenService;
		this.objectMapper = objectMapper;
	}

	/** Single fixed CMS page used by admin builder (spa | offers). */
	@Transactional
	public AdminCmsPageResponse getOrCreate(String pageKey) {
		String key = normalizePageKey(pageKey);
		return pageRepository.findByPageKey(key)
				.map(this::toAdmin)
				.orElseGet(() -> createPage(key));
	}

	@Transactional
	public AdminCmsPageResponse update(String pageKey, UpdateCmsPageRequest request) {
		CmsPage page = requirePage(pageKey);
		if (request.active() != null) {
			page.setActive(request.active());
		}
		pageRepository.save(page);
		return toAdmin(page);
	}

	@Transactional
	public void deactivate(String pageKey) {
		CmsPage page = requirePage(pageKey);
		page.setActive(false);
		pageRepository.save(page);
		for (CmsPageContent content : contentRepository.findByPageId(page.getId())) {
			content.setPublished(false);
			contentRepository.save(content);
		}
	}

	@Transactional
	public AdminCmsPageResponse upsertContent(String pageKey, String locale, CmsPageContentRequest request) {
		validateLocale(locale);
		CmsPage page = requirePage(pageKey);
		upsertContentInternal(page, locale, request);
		return toAdmin(page);
	}

	@Transactional
	public AdminCmsPageResponse publish(String pageKey, String locale) {
		validateLocale(locale);
		CmsPage page = requirePage(pageKey);
		CmsPageContent content = contentRepository.findByPageIdAndLocale(page.getId(), locale)
				.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "CONTENT_MISSING", "Content for locale is missing"));
		if (!page.isActive()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "PAGE_INACTIVE", "Cannot publish inactive page");
		}
		if (blankToNull(content.getTitle()) == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "TITLE_REQUIRED", "Title is required to publish");
		}
		// Fixed public path uses pageKey; keep slug aligned.
		content.setSlug(page.getPageKey());
		documentValidator.validateOrThrow(content.getDocumentDraft());
		content.setDocumentPublished(content.getDocumentDraft());
		content.setPublished(true);
		content.setPublishedAt(Instant.now());
		contentRepository.save(content);
		return toAdmin(page);
	}

	@Transactional
	public AdminCmsPageResponse unpublish(String pageKey, String locale) {
		validateLocale(locale);
		CmsPage page = requirePage(pageKey);
		CmsPageContent content = contentRepository.findByPageIdAndLocale(page.getId(), locale)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_MISSING", "Content for locale is missing"));
		content.setPublished(false);
		contentRepository.save(content);
		return toAdmin(page);
	}

	@Transactional
	public MediaUploadResponse uploadMedia(String pageKey, MultipartFile file) {
		CmsPage page = requirePage(pageKey);
		ImageStorageService.StoredFile stored = imageStorageService.store("cms-pages", page.getId(), file);
		return new MediaUploadResponse(stored.publicUrl(), stored.storageKey());
	}

	@Transactional(readOnly = true)
	public PreviewTokenResponse createPreviewToken(String pageKey, String locale) {
		validateLocale(locale);
		CmsPage page = requirePage(pageKey);
		contentRepository.findByPageIdAndLocale(page.getId(), locale)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_MISSING", "Content for locale is missing"));
		String token = previewTokenService.issue(page.getId(), locale);
		return new PreviewTokenResponse(token, CmsPagePreviewTokenService.TTL_SECONDS);
	}

	private AdminCmsPageResponse createPage(String pageKey) {
		CmsPage page = new CmsPage();
		page.setPageKey(pageKey);
		page.setActive(true);
		pageRepository.save(page);

		CmsPageContent content = new CmsPageContent();
		content.setPage(page);
		content.setLocale("vi");
		content.setSlug(pageKey);
		content.setTitle(DEFAULT_TITLES_VI.getOrDefault(pageKey, pageKey));
		content.setDocumentDraft(DocumentValidator.EMPTY_DOCUMENT);
		contentRepository.save(content);
		return toAdmin(page);
	}

	private void upsertContentInternal(CmsPage page, String locale, CmsPageContentRequest request) {
		CmsPageContent content = contentRepository.findByPageIdAndLocale(page.getId(), locale)
				.orElseGet(() -> {
					CmsPageContent created = new CmsPageContent();
					created.setPage(page);
					created.setLocale(locale);
					created.setSlug(page.getPageKey());
					created.setDocumentDraft(DocumentValidator.EMPTY_DOCUMENT);
					return created;
				});
		// Slug is fixed to pageKey for public routes /spa and /offers.
		content.setSlug(page.getPageKey());
		if (request.title() != null) {
			content.setTitle(blankToNull(request.title()));
		}
		if (request.shortDescription() != null) {
			content.setShortDescription(blankToNull(request.shortDescription()));
		}
		if (request.seoTitle() != null) {
			content.setSeoTitle(blankToNull(request.seoTitle()));
		}
		if (request.seoDescription() != null) {
			content.setSeoDescription(blankToNull(request.seoDescription()));
		}
		if (request.documentDraft() != null) {
			String json;
			try {
				json = objectMapper.writeValueAsString(request.documentDraft());
				objectMapper.readTree(json);
			} catch (Exception ex) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "DOCUMENT_PARSE", "Invalid documentDraft");
			}
			content.setDocumentDraft(json);
		}
		contentRepository.save(content);
	}

	private AdminCmsPageResponse toAdmin(CmsPage page) {
		List<AdminCmsPageResponse.Content> contents = contentRepository.findByPageId(page.getId()).stream()
				.map(c -> new AdminCmsPageResponse.Content(
						c.getLocale(),
						c.getSlug(),
						c.getTitle(),
						c.getShortDescription(),
						c.getSeoTitle(),
						c.getSeoDescription(),
						readJson(c.getDocumentDraft()),
						readJson(c.getDocumentPublished()),
						c.isPublished(),
						cmsStatus(c)
				))
				.toList();
		return new AdminCmsPageResponse(page.getId(), page.getPageKey(), page.isActive(), contents);
	}

	private String cmsStatus(CmsPageContent content) {
		if (blankToNull(content.getTitle()) == null) {
			return "Missing";
		}
		return content.isPublished() ? "Published" : "Draft";
	}

	private Object readJson(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return objectMapper.readValue(raw, Object.class);
		} catch (Exception ex) {
			return null;
		}
	}

	private CmsPage requirePage(String pageKey) {
		String key = normalizePageKey(pageKey);
		return pageRepository.findByPageKey(key)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "CMS page not found"));
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

	private void validateLocale(String locale) {
		if (!"vi".equals(locale) && !"en".equals(locale)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "LOCALE_INVALID", "Locale must be vi or en");
		}
	}

	private String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
