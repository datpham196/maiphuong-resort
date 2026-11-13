package com.maiphuong.nuss.rooms.controller;

import com.maiphuong.nuss.rooms.dto.AvailabilityRequest;
import com.maiphuong.nuss.rooms.dto.AvailabilityResponse;
import com.maiphuong.nuss.rooms.dto.PublicRoomResponse;
import com.maiphuong.nuss.rooms.service.RoomAvailabilityService;
import com.maiphuong.nuss.rooms.service.RoomQueryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class PublicRoomController {

	private final RoomQueryService roomQueryService;
	private final RoomAvailabilityService roomAvailabilityService;

	public PublicRoomController(RoomQueryService roomQueryService, RoomAvailabilityService roomAvailabilityService) {
		this.roomQueryService = roomQueryService;
		this.roomAvailabilityService = roomAvailabilityService;
	}

	@GetMapping
	public List<PublicRoomResponse> list(@RequestParam(defaultValue = "vi") String locale) {
		return roomQueryService.list(locale);
	}

	@PostMapping("/availability")
	public AvailabilityResponse availability(@Valid @RequestBody AvailabilityRequest request) {
		return roomAvailabilityService.check(request);
	}

	@GetMapping("/{slug}")
	public PublicRoomResponse detail(
			@PathVariable String slug,
			@RequestParam(defaultValue = "vi") String locale
	) {
		return roomQueryService.getBySlug(slug, locale);
	}
}
