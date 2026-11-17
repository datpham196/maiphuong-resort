package com.maiphuong.nuss.inquiries.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "guest_inquiries")
public class GuestInquiry {

	@Id
	private UUID id;

	@Column(name = "guest_name", nullable = false)
	private String guestName;

	@Column(name = "guest_email", nullable = false)
	private String guestEmail;

	@Column(name = "guest_phone", length = 50)
	private String guestPhone;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String question;

	@Column(nullable = false, length = 30)
	private String status = "new";

	@Column(name = "staff_answer", columnDefinition = "TEXT")
	private String staffAnswer;

	@Column(name = "answered_at")
	private Instant answeredAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		if (id == null) {
			id = UUID.randomUUID();
		}
		createdAt = now;
		updatedAt = now;
		if (status == null || status.isBlank()) {
			status = "new";
		}
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getGuestName() {
		return guestName;
	}

	public void setGuestName(String guestName) {
		this.guestName = guestName;
	}

	public String getGuestEmail() {
		return guestEmail;
	}

	public void setGuestEmail(String guestEmail) {
		this.guestEmail = guestEmail;
	}

	public String getGuestPhone() {
		return guestPhone;
	}

	public void setGuestPhone(String guestPhone) {
		this.guestPhone = guestPhone;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getStaffAnswer() {
		return staffAnswer;
	}

	public void setStaffAnswer(String staffAnswer) {
		this.staffAnswer = staffAnswer;
	}

	public Instant getAnsweredAt() {
		return answeredAt;
	}

	public void setAnsweredAt(Instant answeredAt) {
		this.answeredAt = answeredAt;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
