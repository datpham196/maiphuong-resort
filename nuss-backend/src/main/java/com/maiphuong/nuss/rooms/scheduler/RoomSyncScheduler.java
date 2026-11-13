package com.maiphuong.nuss.rooms.scheduler;

import com.maiphuong.nuss.rooms.entity.PmsSyncRun;
import com.maiphuong.nuss.rooms.service.RoomSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RoomSyncScheduler {

	private static final Logger log = LoggerFactory.getLogger(RoomSyncScheduler.class);

	private final RoomSyncService roomSyncService;

	public RoomSyncScheduler(RoomSyncService roomSyncService) {
		this.roomSyncService = roomSyncService;
	}

	@Scheduled(cron = "0 0 2 * * *", zone = "Asia/Ho_Chi_Minh")
	public void scheduledSync() {
		try {
			roomSyncService.sync(PmsSyncRun.TriggerType.SCHEDULED);
		} catch (Exception ex) {
			log.warn("Scheduled OnePMS sync failed: {}", ex.getMessage());
		}
	}
}
