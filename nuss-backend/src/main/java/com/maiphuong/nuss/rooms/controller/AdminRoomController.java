package com.maiphuong.nuss.rooms.controller;

import com.maiphuong.nuss.rooms.dto.AdminRoomTypeResponse;
import com.maiphuong.nuss.rooms.dto.RoomContentRequest;
import com.maiphuong.nuss.rooms.dto.RoomImageResponse;
import com.maiphuong.nuss.rooms.dto.SyncRunResponse;
import com.maiphuong.nuss.rooms.entity.PmsSyncRun;
import com.maiphuong.nuss.rooms.service.RoomAdminService;
import com.maiphuong.nuss.rooms.service.RoomSyncService;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminRoomController {

	private final RoomAdminService roomAdminService;
	private final RoomSyncService roomSyncService;

	public AdminRoomController(RoomAdminService roomAdminService, RoomSyncService roomSyncService) {
		this.roomAdminService = roomAdminService;
		this.roomSyncService = roomSyncService;
	}

	@GetMapping("/room-types")
	public List<AdminRoomTypeResponse> list() {
		return roomAdminService.list();
	}

	@GetMapping("/room-types/{id}")
	public AdminRoomTypeResponse get(@PathVariable UUID id) {
		return roomAdminService.get(id);
	}

	@PostMapping("/room-types/sync")
	public SyncRunResponse sync() {
		return roomSyncService.sync(PmsSyncRun.TriggerType.MANUAL);
	}

	@GetMapping("/room-sync-runs")
	public List<SyncRunResponse> syncRuns() {
		return roomSyncService.latestRuns();
	}

	@PutMapping("/room-types/{id}/contents/{locale}")
	public AdminRoomTypeResponse upsertContent(
			@PathVariable UUID id,
			@PathVariable String locale,
			@RequestBody RoomContentRequest request
	) {
		return roomAdminService.upsertContent(id, locale, request);
	}

	@PostMapping("/room-types/{id}/contents/{locale}/publish")
	public AdminRoomTypeResponse publish(@PathVariable UUID id, @PathVariable String locale) {
		return roomAdminService.publish(id, locale);
	}

	@PostMapping("/room-types/{id}/contents/{locale}/unpublish")
	public AdminRoomTypeResponse unpublish(@PathVariable UUID id, @PathVariable String locale) {
		return roomAdminService.unpublish(id, locale);
	}

	@PostMapping(value = "/room-types/{id}/images", consumes = "multipart/form-data")
	public RoomImageResponse upload(
			@PathVariable UUID id,
			@RequestParam("file") MultipartFile file,
			@RequestParam(value = "altText", required = false) String altText,
			@RequestParam(value = "asCover", defaultValue = "false") boolean asCover
	) {
		return roomAdminService.uploadImage(id, file, altText, asCover);
	}

	@PutMapping("/room-types/{id}/images/reorder")
	public List<RoomImageResponse> reorder(@PathVariable UUID id, @RequestBody Map<String, List<UUID>> body) {
		return roomAdminService.reorderImages(id, body.getOrDefault("orderedIds", List.of()));
	}

	@PutMapping("/room-types/{id}/images/{imageId}/cover")
	public RoomImageResponse cover(@PathVariable UUID id, @PathVariable UUID imageId) {
		return roomAdminService.setCover(id, imageId);
	}

	@DeleteMapping("/room-types/{id}/images/{imageId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteImage(@PathVariable UUID id, @PathVariable UUID imageId) {
		roomAdminService.deleteImage(id, imageId);
	}
}
