package com.maiphuong.nuss.rooms.service;

import com.maiphuong.nuss.bookings.RoomPartyAllocator;
import com.maiphuong.nuss.pms.OnePmsClient;
import com.maiphuong.nuss.pms.dto.OnePmsAvailabilityItem;
import com.maiphuong.nuss.rooms.dto.AvailabilityRequest;
import com.maiphuong.nuss.rooms.dto.AvailabilityResponse;
import com.maiphuong.nuss.rooms.entity.RoomContent;
import com.maiphuong.nuss.rooms.entity.RoomType;
import com.maiphuong.nuss.rooms.repository.RoomContentRepository;
import com.maiphuong.nuss.rooms.repository.RoomTypeRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import com.maiphuong.nuss.shared.config.NussProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RoomAvailabilityService {

	private static final DateTimeFormatter PMS_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	private final OnePmsClient onePmsClient;
	private final NussProperties properties;
	private final RoomTypeRepository roomTypeRepository;
	private final RoomContentRepository roomContentRepository;

	public RoomAvailabilityService(
			OnePmsClient onePmsClient,
			NussProperties properties,
			RoomTypeRepository roomTypeRepository,
			RoomContentRepository roomContentRepository
	) {
		this.onePmsClient = onePmsClient;
		this.properties = properties;
		this.roomTypeRepository = roomTypeRepository;
		this.roomContentRepository = roomContentRepository;
	}

	@Transactional(readOnly = true)
	public AvailabilityResponse check(AvailabilityRequest request) {
		validateDates(request.arrivalDate(), request.departureDate());
		String locale = resolveLocale(request.locale());

		List<String> externalIds = resolveExternalIds(request, locale);
		List<OnePmsAvailabilityItem> pmsItems = onePmsClient.checkAvailabilityAndRate(
				properties.onepms().hotelId(),
				externalIds,
				request.arrivalDate().format(PMS_DATE),
				request.departureDate().format(PMS_DATE)
		);

		Map<String, RoomType> byExternalId = new HashMap<>();
		for (RoomType roomType : roomTypeRepository.findAll()) {
			byExternalId.put(roomType.getExternalId(), roomType);
		}

		Map<String, RoomContent> contentByExternalId = new HashMap<>();
		for (RoomContent content : roomContentRepository.findPublishedByLocale(locale)) {
			contentByExternalId.put(content.getRoomType().getExternalId(), content);
		}

		Set<String> filter = externalIds == null || externalIds.isEmpty()
				? null
				: new HashSet<>(externalIds);

		List<AvailabilityResponse.Item> items = new ArrayList<>();
		for (OnePmsAvailabilityItem pmsItem : pmsItems) {
			if (filter != null && !filter.contains(pmsItem.roomTypeId())) {
				continue;
			}
			RoomType roomType = byExternalId.get(pmsItem.roomTypeId());
			RoomContent content = contentByExternalId.get(pmsItem.roomTypeId());
			if (roomType == null || !roomType.isActive() || content == null) {
				continue;
			}

			List<AvailabilityResponse.DailyRate> dailyRates = new ArrayList<>();
			BigDecimal nightlyTotal = BigDecimal.ZERO;
			for (OnePmsAvailabilityItem.DailyRate rate : pmsItem.dailyRates()) {
				LocalDate date = parsePmsDate(rate.date());
				dailyRates.add(new AvailabilityResponse.DailyRate(date, rate.rate()));
				nightlyTotal = nightlyTotal.add(rate.rate());
			}

			int adults = request.adults() == null ? 1 : request.adults();
			int children = request.children() == null ? 0 : request.children();
			RoomPartyAllocator.PartyPlan plan = RoomPartyAllocator.plan(adults, children, roomType.getMaxOccupancy());
			boolean inventoryOk = pmsItem.amount() >= plan.roomsNeeded();
			boolean partyFits = plan.canAllocate() && inventoryOk;
			String blockReason = !plan.canAllocate()
					? plan.blockReason()
					: inventoryOk ? null : "INSUFFICIENT_INVENTORY";
			BigDecimal partyTotal = nightlyTotal.multiply(BigDecimal.valueOf(Math.max(plan.roomsNeeded(), 1)));
			List<AvailabilityResponse.RoomAllocation> allocation = plan.rooms().stream()
					.map(share -> new AvailabilityResponse.RoomAllocation(share.adults(), share.children()))
					.toList();

			String title = content.getTitle() != null ? content.getTitle() : roomType.getName();
			items.add(new AvailabilityResponse.Item(
					roomType.getId().toString(),
					roomType.getExternalId(),
					content.getSlug(),
					title,
					roomType.getMaxOccupancy(),
					pmsItem.amount(),
					pmsItem.amount() > 0,
					nightlyTotal,
					plan.roomsNeeded(),
					partyFits,
					blockReason,
					partyTotal,
					"VND",
					allocation,
					dailyRates
			));
		}

		return new AvailabilityResponse(
				request.arrivalDate(),
				request.departureDate(),
				request.adults(),
				request.children(),
				items
		);
	}

	@Transactional(readOnly = true)
	public OnePmsAvailabilityItem requireAvailable(String externalId, LocalDate arrival, LocalDate departure, int roomsNeeded) {
		validateDates(arrival, departure);
		List<OnePmsAvailabilityItem> items = onePmsClient.checkAvailabilityAndRate(
				properties.onepms().hotelId(),
				List.of(externalId),
				arrival.format(PMS_DATE),
				departure.format(PMS_DATE)
		);
		OnePmsAvailabilityItem match = items.stream()
				.filter(item -> externalId.equals(item.roomTypeId()))
				.findFirst()
				.orElseThrow(() -> new ApiException(
						HttpStatus.CONFLICT,
						"ROOM_UNAVAILABLE",
						"Selected room is not available for these dates"
				));
		if (match.amount() < roomsNeeded) {
			throw new ApiException(
					HttpStatus.CONFLICT,
					"ROOM_UNAVAILABLE",
					"Selected room is not available for these dates"
			);
		}
		if (match.dailyRates() == null || match.dailyRates().isEmpty()) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "Availability rates are missing");
		}
		return match;
	}

	public static String toPmsDate(LocalDate date) {
		return date.format(PMS_DATE);
	}

	private List<String> resolveExternalIds(AvailabilityRequest request, String locale) {
		if (request.slug() != null && !request.slug().isBlank()) {
			RoomContent content = roomContentRepository.findByLocaleAndSlugAndPublishedTrue(locale, request.slug())
					.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found"));
			if (!content.getRoomType().isActive()) {
				throw new ApiException(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found");
			}
			return List.of(content.getRoomType().getExternalId());
		}
		if (request.roomTypeIds() != null && !request.roomTypeIds().isEmpty()) {
			return request.roomTypeIds();
		}
		return List.of();
	}

	private static void validateDates(LocalDate arrival, LocalDate departure) {
		if (arrival == null || departure == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Arrival and departure dates are required");
		}
		if (!departure.isAfter(arrival)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Departure must be after arrival");
		}
		if (arrival.isBefore(LocalDate.now())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Arrival date cannot be in the past");
		}
	}

	private static LocalDate parsePmsDate(String value) {
		try {
			return LocalDate.parse(value, PMS_DATE);
		} catch (Exception ex) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "Invalid rate date from OnePMS: " + value);
		}
	}

	private static String resolveLocale(String locale) {
		if (locale == null || locale.isBlank()) {
			return "vi";
		}
		return locale.toLowerCase().startsWith("en") ? "en" : "vi";
	}
}
