package com.maiphuong.nuss.inquiries.service;

import com.maiphuong.nuss.inquiries.dto.AdminInquiryResponse;
import com.maiphuong.nuss.inquiries.dto.CreateInquiryRequest;
import com.maiphuong.nuss.inquiries.dto.InquiryResponse;
import com.maiphuong.nuss.inquiries.dto.UpdateInquiryRequest;
import com.maiphuong.nuss.inquiries.entity.GuestInquiry;
import com.maiphuong.nuss.inquiries.repository.GuestInquiryRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class InquiryService {

	private static final Set<String> ALLOWED_STATUSES = Set.of("new", "in_progress", "done");

	private final GuestInquiryRepository repository;
	private final InquiryMailService inquiryMailService;

	public InquiryService(GuestInquiryRepository repository, InquiryMailService inquiryMailService) {
		this.repository = repository;
		this.inquiryMailService = inquiryMailService;
	}

	@Transactional
	public InquiryResponse create(CreateInquiryRequest request) {
		GuestInquiry inquiry = new GuestInquiry();
		inquiry.setGuestName(request.guestName().trim());
		inquiry.setGuestEmail(request.guestEmail().trim().toLowerCase(Locale.ROOT));
		inquiry.setGuestPhone(normalizeOptional(request.guestPhone()));
		inquiry.setQuestion(request.question().trim());
		inquiry.setStatus("new");

		GuestInquiry saved = repository.save(inquiry);
		inquiryMailService.sendNewInquiryToResort(saved);

		return new InquiryResponse(
				saved.getId(),
				saved.getStatus(),
				"Your question has been sent. We will get back to you soon."
		);
	}

	@Transactional(readOnly = true)
	public List<AdminInquiryResponse> list(String status) {
		List<GuestInquiry> items;
		if (StringUtils.hasText(status)) {
			String normalized = status.trim().toLowerCase(Locale.ROOT);
			if (!ALLOWED_STATUSES.contains(normalized)) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid status filter");
			}
			items = repository.findByStatusOrderByCreatedAtDesc(normalized);
		} else {
			items = repository.findAllByOrderByCreatedAtDesc();
		}
		return items.stream().map(this::toAdmin).toList();
	}

	@Transactional(readOnly = true)
	public AdminInquiryResponse get(UUID id) {
		return toAdmin(require(id));
	}

	@Transactional
	public AdminInquiryResponse update(UUID id, UpdateInquiryRequest request) {
		GuestInquiry inquiry = require(id);
		boolean sendToGuest = Boolean.TRUE.equals(request.sendToGuest());

		if (request.status() != null) {
			String status = request.status().trim().toLowerCase(Locale.ROOT);
			if (!ALLOWED_STATUSES.contains(status)) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Invalid status");
			}
			inquiry.setStatus(status);
		}

		if (request.staffAnswer() != null) {
			String answer = request.staffAnswer().trim();
			if (answer.isEmpty()) {
				if (sendToGuest) {
					throw new ApiException(
							HttpStatus.BAD_REQUEST,
							"VALIDATION_ERROR",
							"staffAnswer is required to send a reply to the guest"
					);
				}
				inquiry.setStaffAnswer(null);
				inquiry.setAnsweredAt(null);
			} else {
				inquiry.setStaffAnswer(answer);
				inquiry.setAnsweredAt(Instant.now());
			}
		} else if (sendToGuest && !StringUtils.hasText(inquiry.getStaffAnswer())) {
			throw new ApiException(
					HttpStatus.BAD_REQUEST,
					"VALIDATION_ERROR",
					"staffAnswer is required to send a reply to the guest"
			);
		}

		GuestInquiry saved = repository.save(inquiry);
		if (sendToGuest) {
			inquiryMailService.sendAnswerToGuest(saved);
		}
		return toAdmin(saved);
	}

	private GuestInquiry require(UUID id) {
		return repository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Inquiry not found"));
	}

	private AdminInquiryResponse toAdmin(GuestInquiry inquiry) {
		return new AdminInquiryResponse(
				inquiry.getId(),
				inquiry.getGuestName(),
				inquiry.getGuestEmail(),
				inquiry.getGuestPhone(),
				inquiry.getQuestion(),
				inquiry.getStatus(),
				inquiry.getStaffAnswer(),
				inquiry.getAnsweredAt(),
				inquiry.getCreatedAt(),
				inquiry.getUpdatedAt()
		);
	}

	private static String normalizeOptional(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}
}
