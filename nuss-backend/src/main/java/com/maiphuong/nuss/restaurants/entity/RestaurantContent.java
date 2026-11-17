package com.maiphuong.nuss.restaurants.entity;

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

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "restaurant_contents")
public class RestaurantContent {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "restaurant_id", nullable = false)
	private Restaurant restaurant;

	@Column(nullable = false, length = 5)
	private String locale;

	@Column(length = 200)
	private String slug;

	@Column(length = 300)
	private String title;

	@Column(name = "short_description")
	private String shortDescription;

	@Column(name = "seo_title", length = 300)
	private String seoTitle;

	@Column(name = "seo_description")
	private String seoDescription;

	@Column(name = "hero_subtitle")
	private String heroSubtitle;

	@Column(name = "intro_eyebrow", length = 200)
	private String introEyebrow;

	@Column(name = "intro_heading", length = 300)
	private String introHeading;

	@Column(name = "intro_body")
	private String introBody;

	@Column(name = "intro_body_secondary")
	private String introBodySecondary;

	@Column(name = "menu_section_eyebrow", length = 200)
	private String menuSectionEyebrow;

	@Column(name = "menu_section_heading", length = 300)
	private String menuSectionHeading;

	@Column(name = "menu_section_lead")
	private String menuSectionLead;

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

	public Restaurant getRestaurant() {
		return restaurant;
	}

	public void setRestaurant(Restaurant restaurant) {
		this.restaurant = restaurant;
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

	public String getHeroSubtitle() {
		return heroSubtitle;
	}

	public void setHeroSubtitle(String heroSubtitle) {
		this.heroSubtitle = heroSubtitle;
	}

	public String getIntroEyebrow() {
		return introEyebrow;
	}

	public void setIntroEyebrow(String introEyebrow) {
		this.introEyebrow = introEyebrow;
	}

	public String getIntroHeading() {
		return introHeading;
	}

	public void setIntroHeading(String introHeading) {
		this.introHeading = introHeading;
	}

	public String getIntroBody() {
		return introBody;
	}

	public void setIntroBody(String introBody) {
		this.introBody = introBody;
	}

	public String getIntroBodySecondary() {
		return introBodySecondary;
	}

	public void setIntroBodySecondary(String introBodySecondary) {
		this.introBodySecondary = introBodySecondary;
	}

	public String getMenuSectionEyebrow() {
		return menuSectionEyebrow;
	}

	public void setMenuSectionEyebrow(String menuSectionEyebrow) {
		this.menuSectionEyebrow = menuSectionEyebrow;
	}

	public String getMenuSectionHeading() {
		return menuSectionHeading;
	}

	public void setMenuSectionHeading(String menuSectionHeading) {
		this.menuSectionHeading = menuSectionHeading;
	}

	public String getMenuSectionLead() {
		return menuSectionLead;
	}

	public void setMenuSectionLead(String menuSectionLead) {
		this.menuSectionLead = menuSectionLead;
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

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
