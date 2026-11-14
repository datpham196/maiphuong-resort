package com.maiphuong.nuss.cmspages.controller;

import com.maiphuong.nuss.cmspages.dto.PublicCmsPageResponse;
import com.maiphuong.nuss.cmspages.service.CmsPagePreviewTokenService;
import com.maiphuong.nuss.cmspages.service.CmsPageQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cms-pages")
public class PublicCmsPageController {

	private final CmsPageQueryService cmsPageQueryService;
	private final CmsPagePreviewTokenService previewTokenService;

	public PublicCmsPageController(
			CmsPageQueryService cmsPageQueryService,
			CmsPagePreviewTokenService previewTokenService
	) {
		this.cmsPageQueryService = cmsPageQueryService;
		this.previewTokenService = previewTokenService;
	}

	@GetMapping("/{pageKey}/preview")
	public PublicCmsPageResponse preview(
			@PathVariable String pageKey,
			@RequestParam String token
	) {
		return cmsPageQueryService.getPreview(pageKey, token, previewTokenService);
	}

	@GetMapping("/{pageKey}")
	public PublicCmsPageResponse detail(
			@PathVariable String pageKey,
			@RequestParam(defaultValue = "vi") String locale
	) {
		return cmsPageQueryService.getByPageKey(pageKey, locale);
	}
}
