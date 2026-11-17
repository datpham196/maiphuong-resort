package com.maiphuong.nuss.inquiries.controller;

import com.maiphuong.nuss.inquiries.dto.CreateInquiryRequest;
import com.maiphuong.nuss.inquiries.dto.InquiryResponse;
import com.maiphuong.nuss.inquiries.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
public class PublicInquiryController {

	private final InquiryService inquiryService;

	public PublicInquiryController(InquiryService inquiryService) {
		this.inquiryService = inquiryService;
	}

	@PostMapping
	public InquiryResponse create(@Valid @RequestBody CreateInquiryRequest request) {
		return inquiryService.create(request);
	}
}
