package com.maiphuong.nuss.experiences.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "experience_contents")
public class ExperienceContent {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "experience_id", nullable = false)
	private Experience experience;

	@Column(nullable = false, length = 10)
	private String locale;

	private String slug;

	private String title;

	@Column(name = "short_description")
	private String shortDescription;

	@Column(columnDefinition = "text")
	private String description;

	@Column(columnDefinition = "text")
	private String itinerary;

	@Column(name = "duration_text", length = 100)
	private String durationText;

	@Column(name = "price_amount", precision = 12, scale = 2)
	private BigDecimal priceAmount;

	@Column(name = "price_currency", nullable = false, length = 10)
	private String priceCurrency = "VND";

	@Column(name = "price_note")
	private String priceNote;

	@Column(columnDefinition = "text")
	private String conditions;

	@Column(name = "seo_title")
	private String seoTitle;

	@Column(name = "seo_description")
	private String seoDescription;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "document_draft", nullable = false, columnDefinition = "jsonb")
	private String documentDraft =
			"{\"version\":1,\"root\":{\"id\":\"root\",\"type\":\"root\",\"props\":{},\"children\":[]}}";

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "document_published", columnDefinition = "jsonb")
	private String documentPublished;

	@Column(name = "is_published", nullable = false)
	private boolean published = false;

	@Column(name = "published_at")
	private Instant publishedAt;

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

	public Experience getExperience() {
		return experience;
	}

	public void setExperience(Experience experience) {
		this.experience = experience;
	}

	public String getLocale() {
		return locale;
	}

	public void setLocale(String locale) {
		this.locale = locale;
	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getShortDescription() {
		return shortDescription;
	}

	public void setShortDescription(String shortDescription) {
		this.shortDescription = shortDescription;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getItinerary() {
		return itinerary;
	}

	public void setItinerary(String itinerary) {
		this.itinerary = itinerary;
	}

	public String getDurationText() {
		return durationText;
	}

	public void setDurationText(String durationText) {
		this.durationText = durationText;
	}

	public BigDecimal getPriceAmount() {
		return priceAmount;
	}

	public void setPriceAmount(BigDecimal priceAmount) {
		this.priceAmount = priceAmount;
	}

	public String getPriceCurrency() {
		return priceCurrency;
	}

	public void setPriceCurrency(String priceCurrency) {
		this.priceCurrency = priceCurrency;
	}

	public String getPriceNote() {
		return priceNote;
	}

	public void setPriceNote(String priceNote) {
		this.priceNote = priceNote;
	}

	public String getConditions() {
		return conditions;
	}

	public void setConditions(String conditions) {
		this.conditions = conditions;
	}

	public String getSeoTitle() {
		return seoTitle;
	}

	public void setSeoTitle(String seoTitle) {
		this.seoTitle = seoTitle;
	}

	public String getSeoDescription() {
		return seoDescription;
	}

	public void setSeoDescription(String seoDescription) {
		this.seoDescription = seoDescription;
	}

	public String getDocumentDraft() {
		return documentDraft;
	}

	public void setDocumentDraft(String documentDraft) {
		this.documentDraft = documentDraft;
	}

	public String getDocumentPublished() {
		return documentPublished;
	}

	public void setDocumentPublished(String documentPublished) {
		this.documentPublished = documentPublished;
	}

	public boolean isPublished() {
		return published;
	}

	public void setPublished(boolean published) {
		this.published = published;
	}

	public Instant getPublishedAt() {
		return publishedAt;
	}

	public void setPublishedAt(Instant publishedAt) {
		this.publishedAt = publishedAt;
	}
}
