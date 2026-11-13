package com.maiphuong.nuss.bookings.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.bookings.RoomPartyAllocator;
import com.maiphuong.nuss.bookings.dto.BookingItemRequest;
import com.maiphuong.nuss.bookings.dto.CreateBookingRequest;
import com.maiphuong.nuss.bookings.dto.CreateBookingResponse;
import com.maiphuong.nuss.bookings.entity.BookingRequest;
import com.maiphuong.nuss.bookings.repository.BookingRequestRepository;
import com.maiphuong.nuss.pms.OnePmsClient;
import com.maiphuong.nuss.pms.dto.OnePmsAvailabilityItem;
import com.maiphuong.nuss.pms.dto.OnePmsBookingResult;
import com.maiphuong.nuss.rooms.entity.RoomContent;
import com.maiphuong.nuss.rooms.entity.RoomType;
import com.maiphuong.nuss.rooms.repository.RoomContentRepository;
import com.maiphuong.nuss.rooms.service.RoomAvailabilityService;
import com.maiphuong.nuss.shared.api.ApiException;
import com.maiphuong.nuss.shared.config.NussProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

	private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.BASIC_ISO_DATE;
	private static final SecureRandom RANDOM = new SecureRandom();

	private final BookingRequestRepository bookingRequestRepository;
	private final RoomContentRepository roomContentRepository;
	private final RoomAvailabilityService roomAvailabilityService;
	private final OnePmsClient onePmsClient;
	private final NussProperties properties;
	private final ObjectMapper objectMapper;
	private final BookingMailService bookingMailService;

	public BookingService(
			BookingRequestRepository bookingRequestRepository,
			RoomContentRepository roomContentRepository,
			RoomAvailabilityService roomAvailabilityService,
			OnePmsClient onePmsClient,
			NussProperties properties,
			ObjectMapper objectMapper,
			BookingMailService bookingMailService
	) {
		this.bookingRequestRepository = bookingRequestRepository;
		this.roomContentRepository = roomContentRepository;
		this.roomAvailabilityService = roomAvailabilityService;
		this.onePmsClient = onePmsClient;
		this.properties = properties;
		this.objectMapper = objectMapper;
		this.bookingMailService = bookingMailService;
	}

	@Transactional
	public CreateBookingResponse create(CreateBookingRequest request) {
		String locale = resolveLocale(request.locale());
		if (request.items() == null || request.items().isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Booking items are required");
		}
		if (request.partyAdults() < 1) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Party must include at least one adult");
		}

		List<Map<String, Object>> roomPayloads = new ArrayList<>();
		List<CreateBookingResponse.Item> responseItems = new ArrayList<>();
		List<Map<String, Object>> auditItems = new ArrayList<>();
		Map<String, Integer> inventoryNeededByExternalId = new HashMap<>();

		BigDecimal totalAmount = BigDecimal.ZERO;
		int totalAdults = 0;
		int totalChildren = 0;
		int totalRooms = 0;

		RoomContent firstContent = null;
		RoomType firstRoomType = null;

		for (BookingItemRequest item : request.items()) {
			RoomContent content = roomContentRepository.findByLocaleAndSlugAndPublishedTrue(locale, item.slug())
					.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found: " + item.slug()));
			RoomType roomType = content.getRoomType();
			if (!roomType.isActive()) {
				throw new ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found: " + item.slug());
			}
			if (firstContent == null) {
				firstContent = content;
				firstRoomType = roomType;
			}

			List<RoomPartyAllocator.RoomShare> shares = RoomPartyAllocator.requirePlan(
					item.adults(),
					item.children(),
					roomType.getMaxOccupancy()
			);
			int roomsNeeded = shares.size();
			totalRooms += roomsNeeded;
			totalAdults += item.adults();
			totalChildren += item.children();
			inventoryNeededByExternalId.merge(roomType.getExternalId(), roomsNeeded, Integer::sum);

			OnePmsAvailabilityItem availability = roomAvailabilityService.requireAvailable(
					roomType.getExternalId(),
					request.arrivalDate(),
					request.departureDate(),
					inventoryNeededByExternalId.get(roomType.getExternalId())
			);

			List<BigDecimal> rates = availability.dailyRates().stream()
					.map(OnePmsAvailabilityItem.DailyRate::rate)
					.toList();
			BigDecimal perRoomTotal = rates.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
			BigDecimal lineTotal = perRoomTotal.multiply(BigDecimal.valueOf(roomsNeeded));
			totalAmount = totalAmount.add(lineTotal);

			for (RoomPartyAllocator.RoomShare share : shares) {
				Map<String, Object> roomPayload = new LinkedHashMap<>();
				roomPayload.put("roomTypeID", roomType.getExternalId());
				roomPayload.put("breakfast", false);
				roomPayload.put("adult", share.adults());
				roomPayload.put("child", share.children());
				roomPayload.put("rates", rates);
				roomPayloads.add(roomPayload);
			}

			List<CreateBookingResponse.RoomAllocation> allocation = shares.stream()
					.map(share -> new CreateBookingResponse.RoomAllocation(share.adults(), share.children()))
					.toList();
			String title = content.getTitle() != null ? content.getTitle() : roomType.getName();
			responseItems.add(new CreateBookingResponse.Item(
					content.getSlug(),
					title,
					item.adults(),
					item.children(),
					roomsNeeded,
					allocation,
					lineTotal
			));
			Map<String, Object> audit = new LinkedHashMap<>();
			audit.put("slug", content.getSlug());
			audit.put("title", title);
			audit.put("externalId", roomType.getExternalId());
			audit.put("adults", item.adults());
			audit.put("children", item.children());
			audit.put("roomCount", roomsNeeded);
			audit.put("allocation", shares);
			audit.put("lineTotal", lineTotal);
			audit.put("dailyRates", availability.dailyRates());
			auditItems.add(audit);
		}

		int partyGuests = request.partyAdults() + Math.max(0, request.partyChildren());
		int cartGuests = totalAdults + totalChildren;
		if (cartGuests < partyGuests) {
			throw new ApiException(
					HttpStatus.BAD_REQUEST,
					"PARTY_CAPACITY_SHORT",
					"Cart seats " + cartGuests + " guests but party size is " + partyGuests
			);
		}

		if (totalRooms > RoomPartyAllocator.MAX_SELF_SERVE_ROOMS) {
			throw new ApiException(
					HttpStatus.BAD_REQUEST,
					"TOO_MANY_ROOMS",
					"Booking exceeds online room limit (" + RoomPartyAllocator.MAX_SELF_SERVE_ROOMS + ")"
			);
		}

		Map<String, Object> bookingBody = new LinkedHashMap<>();
		bookingBody.put("hotelID", properties.onepms().hotelId());
		String guestEmail = request.guestEmail().trim();
		bookingBody.put("name", request.guestName().trim());
		bookingBody.put("phone", request.guestPhone().trim());
		bookingBody.put("email", guestEmail);
		if (request.notes() != null && !request.notes().isBlank()) {
			bookingBody.put("notes", request.notes().trim());
		}
		bookingBody.put("arrivalDate", RoomAvailabilityService.toPmsDate(request.arrivalDate()));
		bookingBody.put("departureDate", RoomAvailabilityService.toPmsDate(request.departureDate()));
		bookingBody.put("paymentAmount", 0);
		bookingBody.put("rooms", roomPayloads);

		OnePmsBookingResult pmsResult = onePmsClient.addBooking(bookingBody);

		BookingRequest entity = new BookingRequest();
		entity.setRequestCode(nextRequestCode());
		entity.setRoomTypeId(firstRoomType.getId());
		entity.setRoomExternalId(firstRoomType.getExternalId());
		entity.setRoomSlug(firstContent.getSlug());
		entity.setRoomName(firstContent.getTitle() != null ? firstContent.getTitle() : firstRoomType.getName());
		entity.setArrivalDate(request.arrivalDate());
		entity.setDepartureDate(request.departureDate());
		entity.setAdults(totalAdults);
		entity.setChildren(totalChildren);
		entity.setRoomCount(totalRooms);
		entity.setGuestName(request.guestName().trim());
		entity.setGuestPhone(request.guestPhone().trim());
		entity.setGuestEmail(guestEmail);
		entity.setNotes(blankToNull(request.notes()));
		entity.setStatus("confirmed");
		entity.setMode("pms");
		entity.setTotalAmount(totalAmount);
		entity.setCurrency("VND");
		entity.setPmsBookingReference(pmsResult.bookingReference());
		entity.setPmsBookingIds(writeJson(pmsResult.bookingIds()));
		entity.setItemsJson(writeJson(auditItems));
		entity.setAvailabilitySnapshot(writeJson(Map.of("items", auditItems)));
		bookingRequestRepository.save(entity);

		CreateBookingResponse response = new CreateBookingResponse(
				entity.getRequestCode(),
				entity.getMode(),
				entity.getStatus(),
				entity.getPmsBookingReference(),
				entity.getRoomSlug(),
				entity.getRoomName(),
				entity.getArrivalDate(),
				entity.getDepartureDate(),
				entity.getAdults(),
				entity.getChildren(),
				entity.getRoomCount(),
				responseItems,
				entity.getTotalAmount(),
				entity.getCurrency()
		);
		bookingMailService.sendBookingEmails(response, entity.getGuestName(), guestEmail);
		return response;
	}

	private String nextRequestCode() {
		String prefix = "MP-" + LocalDate.now().format(CODE_DATE) + "-";
		for (int attempt = 0; attempt < 20; attempt++) {
			String code = prefix + String.format("%04d", RANDOM.nextInt(10000));
			if (!bookingRequestRepository.existsByRequestCode(code)) {
				return code;
			}
		}
		throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "CODE_GEN_FAILED", "Could not allocate request code");
	}

	private String writeJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (Exception ex) {
			return value instanceof List<?> ? "[]" : "{}";
		}
	}

	private static String blankToNull(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	private static String resolveLocale(String locale) {
		if (locale == null || locale.isBlank()) {
			return "vi";
		}
		return locale.toLowerCase().startsWith("en") ? "en" : "vi";
	}
}
