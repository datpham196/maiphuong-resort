package com.maiphuong.nuss.rooms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.maiphuong.nuss.pms.OnePmsClient;
import com.maiphuong.nuss.pms.dto.OnePmsRoomTypeDto;
import com.maiphuong.nuss.rooms.dto.SyncRunResponse;
import com.maiphuong.nuss.rooms.entity.PmsSyncRun;
import com.maiphuong.nuss.rooms.entity.RoomType;
import com.maiphuong.nuss.rooms.repository.PmsSyncRunRepository;
import com.maiphuong.nuss.rooms.repository.RoomTypeRepository;
import com.maiphuong.nuss.shared.api.ApiException;
import com.maiphuong.nuss.shared.config.NussProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoomSyncService {

	private static final Logger log = LoggerFactory.getLogger(RoomSyncService.class);

	private final OnePmsClient onePmsClient;
	private final RoomTypeRepository roomTypeRepository;
	private final PmsSyncRunRepository syncRunRepository;
	private final SyncRunRecorder syncRunRecorder;
	private final NussProperties properties;
	private final ObjectMapper objectMapper;
	private final RoomContentSeedService roomContentSeedService;

	public RoomSyncService(
			OnePmsClient onePmsClient,
			RoomTypeRepository roomTypeRepository,
			PmsSyncRunRepository syncRunRepository,
			SyncRunRecorder syncRunRecorder,
			NussProperties properties,
			ObjectMapper objectMapper,
			RoomContentSeedService roomContentSeedService
	) {
		this.onePmsClient = onePmsClient;
		this.roomTypeRepository = roomTypeRepository;
		this.syncRunRepository = syncRunRepository;
		this.syncRunRecorder = syncRunRecorder;
		this.properties = properties;
		this.objectMapper = objectMapper;
		this.roomContentSeedService = roomContentSeedService;
	}

	@Transactional
	public SyncRunResponse sync(PmsSyncRun.TriggerType triggerType) {
		if (syncRunRepository.existsByStatus(PmsSyncRun.Status.RUNNING)) {
			throw new ApiException(HttpStatus.CONFLICT, "SYNC_RUNNING", "A room sync is already running");
		}

		PmsSyncRun run = syncRunRecorder.start(triggerType);

		try {
			String hotelId = properties.onepms().hotelId();
			List<OnePmsRoomTypeDto> snapshot = onePmsClient.getRoomTypes(hotelId);
			if (snapshot.isEmpty()) {
				fail(run, "OnePMS returned an empty room type list; catalog left unchanged");
				return toResponse(run);
			}

			Instant seenAt = Instant.now();
			int created = 0;
			int updated = 0;
			Set<String> seenExternalIds = new HashSet<>();

			for (OnePmsRoomTypeDto dto : snapshot) {
				seenExternalIds.add(dto.roomTypeId());
				var existing = roomTypeRepository.findByExternalId(dto.roomTypeId());
				if (existing.isEmpty()) {
					RoomType roomType = new RoomType();
					applyPmsFields(roomType, dto, hotelId, seenAt);
					roomTypeRepository.save(roomType);
					created++;
				} else {
					RoomType roomType = existing.get();
					applyPmsFields(roomType, dto, hotelId, seenAt);
					roomTypeRepository.save(roomType);
					updated++;
				}
			}

			int deactivated = 0;
			for (RoomType active : roomTypeRepository.findByHotelIdAndActiveTrue(hotelId)) {
				if (!seenExternalIds.contains(active.getExternalId())) {
					active.setActive(false);
					roomTypeRepository.save(active);
					deactivated++;
				}
			}

			roomContentSeedService.applySeeds();

			run.setTotalFetched(snapshot.size());
			run.setTotalCreated(created);
			run.setTotalUpdated(updated);
			run.setTotalDeactivated(deactivated);
			run.setStatus(PmsSyncRun.Status.SUCCESS);
			run.setFinishedAt(Instant.now());
			syncRunRecorder.save(run);
			log.info("OnePMS room sync succeeded: fetched={}, created={}, updated={}, deactivated={}",
					snapshot.size(), created, updated, deactivated);
			return toResponse(run);
		} catch (ApiException ex) {
			fail(run, ex.getMessage());
			throw ex;
		} catch (Exception ex) {
			fail(run, ex.getMessage());
			throw new ApiException(HttpStatus.BAD_GATEWAY, "SYNC_FAILED", "Room sync failed");
		}
	}

	private void applyPmsFields(RoomType roomType, OnePmsRoomTypeDto dto, String hotelId, Instant seenAt) {
		roomType.setExternalId(dto.roomTypeId());
		roomType.setHotelId(hotelId);
		roomType.setName(dto.name());
		roomType.setMaxOccupancy(dto.guest());
		roomType.setRackRate(dto.price());
		roomType.setInventoryCount(dto.num());
		roomType.setActive(true);
		roomType.setLastSeenAt(seenAt);
		try {
			roomType.setBedsJson(dto.beds() == null ? "[]" : objectMapper.writeValueAsString(dto.beds()));
			roomType.setPmsData(dto.raw() == null ? "{}" : objectMapper.writeValueAsString(dto.raw()));
		} catch (Exception ex) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "ONEPMS_SCHEMA", "Failed to serialize OnePMS room payload");
		}
	}

	private void fail(PmsSyncRun run, String message) {
		run.setStatus(PmsSyncRun.Status.FAILED);
		run.setFinishedAt(Instant.now());
		run.setErrorMessage(message == null ? "Unknown sync error" : message.substring(0, Math.min(message.length(), 1000)));
		syncRunRecorder.save(run);
		log.warn("OnePMS room sync failed: {}", run.getErrorMessage());
	}

	public List<SyncRunResponse> latestRuns() {
		return syncRunRepository.findTop20ByOrderByStartedAtDesc().stream().map(this::toResponse).toList();
	}

	public SyncRunResponse latestRun() {
		return syncRunRepository.findFirstByOrderByStartedAtDesc().map(this::toResponse).orElse(null);
	}

	private SyncRunResponse toResponse(PmsSyncRun run) {
		return new SyncRunResponse(
				run.getId(),
				run.getTriggerType().name(),
				run.getStatus().name(),
				run.getStartedAt(),
				run.getFinishedAt(),
				run.getTotalFetched(),
				run.getTotalCreated(),
				run.getTotalUpdated(),
				run.getTotalDeactivated(),
				run.getErrorMessage()
		);
	}
}
