package com.maiphuong.nuss.rooms.dto;

import java.time.Instant;
import java.util.UUID;

public record SyncRunResponse(
		UUID id,
		String trigger,
		String status,
		Instant startedAt,
		Instant finishedAt,
		int totalFetched,
		int totalCreated,
		int totalUpdated,
		int totalDeactivated,
		String errorMessage
) {
}
