package com.maiphuong.nuss.rooms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pms_sync_runs")
public class PmsSyncRun {

	public enum TriggerType {
		SCHEDULED, MANUAL
	}

	public enum Status {
		RUNNING, SUCCESS, FAILED
	}

	@Id
	private UUID id;

	@Enumerated(EnumType.STRING)
	@Column(name = "trigger_type", nullable = false, length = 20)
	private TriggerType triggerType;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private Status status;

	@Column(name = "started_at", nullable = false)
	private Instant startedAt;

	@Column(name = "finished_at")
	private Instant finishedAt;

	@Column(name = "total_fetched", nullable = false)
	private int totalFetched;

	@Column(name = "total_created", nullable = false)
	private int totalCreated;

	@Column(name = "total_updated", nullable = false)
	private int totalUpdated;

	@Column(name = "total_deactivated", nullable = false)
	private int totalDeactivated;

	@Column(name = "error_message")
	private String errorMessage;

	@PrePersist
	void onCreate() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		if (startedAt == null) {
			startedAt = Instant.now();
		}
	}

	public UUID getId() {
		return id;
	}

	public TriggerType getTriggerType() {
		return triggerType;
	}

	public void setTriggerType(TriggerType triggerType) {
		this.triggerType = triggerType;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Instant getStartedAt() {
		return startedAt;
	}

	public void setStartedAt(Instant startedAt) {
		this.startedAt = startedAt;
	}

	public Instant getFinishedAt() {
		return finishedAt;
	}

	public void setFinishedAt(Instant finishedAt) {
		this.finishedAt = finishedAt;
	}

	public int getTotalFetched() {
		return totalFetched;
	}

	public void setTotalFetched(int totalFetched) {
		this.totalFetched = totalFetched;
	}

	public int getTotalCreated() {
		return totalCreated;
	}

	public void setTotalCreated(int totalCreated) {
		this.totalCreated = totalCreated;
	}

	public int getTotalUpdated() {
		return totalUpdated;
	}

	public void setTotalUpdated(int totalUpdated) {
		this.totalUpdated = totalUpdated;
	}

	public int getTotalDeactivated() {
		return totalDeactivated;
	}

	public void setTotalDeactivated(int totalDeactivated) {
		this.totalDeactivated = totalDeactivated;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}
}
