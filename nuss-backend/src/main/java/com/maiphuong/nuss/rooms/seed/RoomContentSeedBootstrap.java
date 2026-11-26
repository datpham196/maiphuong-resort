package com.maiphuong.nuss.rooms.seed;

import com.maiphuong.nuss.rooms.service.RoomContentSeedService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RoomContentSeedBootstrap {

	private static final Logger log = LoggerFactory.getLogger(RoomContentSeedBootstrap.class);

	private final RoomContentSeedService roomContentSeedService;

	public RoomContentSeedBootstrap(RoomContentSeedService roomContentSeedService) {
		this.roomContentSeedService = roomContentSeedService;
	}

	@EventListener(ApplicationReadyEvent.class)
	public void onReady() {
		try {
			int touched = roomContentSeedService.applySeeds();
			if (touched > 0) {
				log.info("Room content seed bootstrap updated {} locale row(s)", touched);
			}
		} catch (Exception ex) {
			log.warn("Room content seed bootstrap skipped: {}", ex.getMessage());
		}
	}
}
