package com.maiphuong.nuss.bookings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "booking_requests")
public class BookingRequest {

	@Id
	private UUID id;

	@Column(name = "request_code", nullable = false, unique = true, length = 40)
	private String requestCode;

	@Column(name = "room_type_id")
	private UUID roomTypeId;

	@Column(name = "room_external_id", nullable = false, length = 100)
	private String roomExternalId;

	@Column(name = "room_slug")
	private String roomSlug;

	@Column(name = "room_name")
	private String roomName;

	@Column(name = "arrival_date", nullable = false)
	private LocalDate arrivalDate;

	@Column(name = "departure_date", nullable = false)
	private LocalDate departureDate;

	@Column(nullable = false)
	private int adults;

	@Column(nullable = false)
	private int children;

	@Column(name = "room_count", nullable = false)
	private int roomCount = 1;

	@Column(name = "guest_name", nullable = false)
	private String guestName;

	@Column(name = "guest_phone", nullable = false, length = 50)
	private String guestPhone;

	@Column(name = "guest_email")
	private String guestEmail;

	@Column
	private String notes;

	@Column(nullable = false, length = 30)
	private String status = "new";

	@Column(nullable = false, length = 30)
	private String mode = "request";

	@Column(name = "total_amount", precision = 14, scale = 2)
	private BigDecimal totalAmount;

	@Column(nullable = false, length = 10)
	private String currency = "VND";

	@Column(name = "pms_booking_reference", length = 100)
	private String pmsBookingReference;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "pms_booking_ids", nullable = false, columnDefinition = "jsonb")
	private String pmsBookingIds = "[]";

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "availability_snapshot", nullable = false, columnDefinition = "jsonb")
	private String availabilitySnapshot = "{}";

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "items_json", nullable = false, columnDefinition = "jsonb")
	private String itemsJson = "[]";

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
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public String getRequestCode() {
		return requestCode;
	}

	public void setRequestCode(String requestCode) {
		this.requestCode = requestCode;
	}

	public UUID getRoomTypeId() {
		return roomTypeId;
	}

	public void setRoomTypeId(UUID roomTypeId) {
		this.roomTypeId = roomTypeId;
	}

	public String getRoomExternalId() {
		return roomExternalId;
	}

	public void setRoomExternalId(String roomExternalId) {
		this.roomExternalId = roomExternalId;
	}

	public String getRoomSlug() {
		return roomSlug;
	}

	public void setRoomSlug(String roomSlug) {
		this.roomSlug = roomSlug;
	}

	public String getRoomName() {
		return roomName;
	}

	public void setRoomName(String roomName) {
		this.roomName = roomName;
	}

	public LocalDate getArrivalDate() {
		return arrivalDate;
	}

	public void setArrivalDate(LocalDate arrivalDate) {
		this.arrivalDate = arrivalDate;
	}

	public LocalDate getDepartureDate() {
		return departureDate;
	}

	public void setDepartureDate(LocalDate departureDate) {
		this.departureDate = departureDate;
	}

	public int getAdults() {
		return adults;
	}

	public void setAdults(int adults) {
		this.adults = adults;
	}

	public int getChildren() {
		return children;
	}

	public void setChildren(int children) {
		this.children = children;
	}

	public int getRoomCount() {
		return roomCount;
	}

	public void setRoomCount(int roomCount) {
		this.roomCount = roomCount;
	}

	public String getGuestName() {
		return guestName;
	}

	public void setGuestName(String guestName) {
		this.guestName = guestName;
	}

	public String getGuestPhone() {
		return guestPhone;
	}

	public void setGuestPhone(String guestPhone) {
		this.guestPhone = guestPhone;
	}

	public String getGuestEmail() {
		return guestEmail;
	}

	public void setGuestEmail(String guestEmail) {
		this.guestEmail = guestEmail;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public String getPmsBookingReference() {
		return pmsBookingReference;
	}

	public void setPmsBookingReference(String pmsBookingReference) {
		this.pmsBookingReference = pmsBookingReference;
	}

	public String getPmsBookingIds() {
		return pmsBookingIds;
	}

	public void setPmsBookingIds(String pmsBookingIds) {
		this.pmsBookingIds = pmsBookingIds;
	}

	public String getAvailabilitySnapshot() {
		return availabilitySnapshot;
	}

	public void setAvailabilitySnapshot(String availabilitySnapshot) {
		this.availabilitySnapshot = availabilitySnapshot;
	}

	public String getItemsJson() {
		return itemsJson;
	}

	public void setItemsJson(String itemsJson) {
		this.itemsJson = itemsJson;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
