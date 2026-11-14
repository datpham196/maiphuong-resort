package com.maiphuong.nuss.cmspages.entity;

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
@Table(name = "cms_page_contents")
public class CmsPageContent {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "page_id", nullable = false)
	private CmsPage page;

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

	public CmsPage getPage() {
		return page;
	}

	public void setPage(CmsPage page) {
		this.page = page;
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
