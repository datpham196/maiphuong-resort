package com.maiphuong.nuss.rooms.entity;

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
import java.util.UUID;

@Entity
@Table(name = "room_types")
public class RoomType {

	@Id
	private UUID id;

	@Column(name = "external_id", nullable = false, unique = true, length = 100)
	private String externalId;

	@Column(name = "hotel_id", nullable = false, length = 100)
	private String hotelId;

	@Column(nullable = false)
	private String name;

	@Column(name = "max_occupancy")
	private Integer maxOccupancy;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "beds_json", nullable = false, columnDefinition = "jsonb")
	private String bedsJson = "[]";

	@Column(name = "rack_rate", precision = 12, scale = 2)
	private BigDecimal rackRate;

	@Column(name = "inventory_count")
	private Integer inventoryCount;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "pms_data", nullable = false, columnDefinition = "jsonb")
	private String pmsData = "{}";

	@Column(name = "is_active", nullable = false)
	private boolean active = true;

	@Column(name = "last_seen_at")
	private Instant lastSeenAt;

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

	public void setId(UUID id) {
		this.id = id;
	}

	public String getExternalId() {
		return externalId;
	}

	public void setExternalId(String externalId) {
		this.externalId = externalId;
	}

	public String getHotelId() {
		return hotelId;
	}

	public void setHotelId(String hotelId) {
		this.hotelId = hotelId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getMaxOccupancy() {
		return maxOccupancy;
	}

	public void setMaxOccupancy(Integer maxOccupancy) {
		this.maxOccupancy = maxOccupancy;
	}

	public String getBedsJson() {
		return bedsJson;
	}

	public void setBedsJson(String bedsJson) {
		this.bedsJson = bedsJson;
	}

	public BigDecimal getRackRate() {
		return rackRate;
	}

	public void setRackRate(BigDecimal rackRate) {
		this.rackRate = rackRate;
	}

	public Integer getInventoryCount() {
		return inventoryCount;
	}

	public void setInventoryCount(Integer inventoryCount) {
		this.inventoryCount = inventoryCount;
	}

	public String getPmsData() {
		return pmsData;
	}

	public void setPmsData(String pmsData) {
		this.pmsData = pmsData;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public Instant getLastSeenAt() {
		return lastSeenAt;
	}

	public void setLastSeenAt(Instant lastSeenAt) {
		this.lastSeenAt = lastSeenAt;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
