package com.maiphuong.nuss.cmspages.controller;

import com.maiphuong.nuss.cmspages.dto.AdminCmsPageResponse;
import com.maiphuong.nuss.cmspages.dto.CmsPageContentRequest;
import com.maiphuong.nuss.cmspages.dto.MediaUploadResponse;
import com.maiphuong.nuss.cmspages.dto.PreviewTokenResponse;
import com.maiphuong.nuss.cmspages.dto.UpdateCmsPageRequest;
import com.maiphuong.nuss.cmspages.service.CmsPageAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/cms-pages")
public class AdminCmsPageController {

	private final CmsPageAdminService cmsPageAdminService;

	public AdminCmsPageController(CmsPageAdminService cmsPageAdminService) {
		this.cmsPageAdminService = cmsPageAdminService;
	}

	@GetMapping("/{pageKey}")
	public AdminCmsPageResponse get(@PathVariable String pageKey) {
		return cmsPageAdminService.getOrCreate(pageKey);
	}

	@PutMapping("/{pageKey}")
	public AdminCmsPageResponse update(@PathVariable String pageKey, @RequestBody UpdateCmsPageRequest request) {
		return cmsPageAdminService.update(pageKey, request);
	}

	@DeleteMapping("/{pageKey}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deactivate(@PathVariable String pageKey) {
		cmsPageAdminService.deactivate(pageKey);
	}

	@PutMapping("/{pageKey}/contents/{locale}")
	public AdminCmsPageResponse upsertContent(
			@PathVariable String pageKey,
			@PathVariable String locale,
			@RequestBody CmsPageContentRequest request
	) {
		return cmsPageAdminService.upsertContent(pageKey, locale, request);
	}

	@PostMapping("/{pageKey}/contents/{locale}/publish")
	public AdminCmsPageResponse publish(@PathVariable String pageKey, @PathVariable String locale) {
		return cmsPageAdminService.publish(pageKey, locale);
	}

	@PostMapping("/{pageKey}/contents/{locale}/unpublish")
	public AdminCmsPageResponse unpublish(@PathVariable String pageKey, @PathVariable String locale) {
		return cmsPageAdminService.unpublish(pageKey, locale);
	}

	@PostMapping(value = "/{pageKey}/media", consumes = "multipart/form-data")
	public MediaUploadResponse uploadMedia(
			@PathVariable String pageKey,
			@RequestParam("file") MultipartFile file
	) {
		return cmsPageAdminService.uploadMedia(pageKey, file);
	}

	@PostMapping("/{pageKey}/preview-token")
	public PreviewTokenResponse previewToken(
			@PathVariable String pageKey,
			@RequestParam(defaultValue = "vi") String locale
	) {
		return cmsPageAdminService.createPreviewToken(pageKey, locale);
	}
}
