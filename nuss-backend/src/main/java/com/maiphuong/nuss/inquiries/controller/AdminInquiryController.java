package com.maiphuong.nuss.inquiries.controller;

import com.maiphuong.nuss.inquiries.dto.AdminInquiryResponse;
import com.maiphuong.nuss.inquiries.dto.UpdateInquiryRequest;
import com.maiphuong.nuss.inquiries.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

	private final InquiryService inquiryService;

	public AdminInquiryController(InquiryService inquiryService) {
		this.inquiryService = inquiryService;
	}

	@GetMapping
	public List<AdminInquiryResponse> list(@RequestParam(value = "status", required = false) String status) {
		return inquiryService.list(status);
	}

	@GetMapping("/{id}")
	public AdminInquiryResponse get(@PathVariable UUID id) {
		return inquiryService.get(id);
	}

	@PatchMapping("/{id}")
	public AdminInquiryResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateInquiryRequest request) {
		return inquiryService.update(id, request);
	}
}
