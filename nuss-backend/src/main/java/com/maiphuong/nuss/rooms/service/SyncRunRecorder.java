package com.maiphuong.nuss.rooms.service;

import com.maiphuong.nuss.rooms.entity.PmsSyncRun;
import com.maiphuong.nuss.rooms.repository.PmsSyncRunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class SyncRunRecorder {

	private final PmsSyncRunRepository syncRunRepository;

	public SyncRunRecorder(PmsSyncRunRepository syncRunRepository) {
		this.syncRunRepository = syncRunRepository;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public PmsSyncRun start(PmsSyncRun.TriggerType triggerType) {
		PmsSyncRun run = new PmsSyncRun();
		run.setTriggerType(triggerType);
		run.setStatus(PmsSyncRun.Status.RUNNING);
		run.setStartedAt(Instant.now());
		return syncRunRepository.save(run);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public PmsSyncRun save(PmsSyncRun run) {
		return syncRunRepository.save(run);
	}
}
