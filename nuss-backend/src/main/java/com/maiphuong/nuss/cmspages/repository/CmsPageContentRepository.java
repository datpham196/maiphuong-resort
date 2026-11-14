package com.maiphuong.nuss.cmspages.repository;

import com.maiphuong.nuss.cmspages.entity.CmsPageContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CmsPageContentRepository extends JpaRepository<CmsPageContent, UUID> {

	List<CmsPageContent> findByPageId(UUID pageId);

	Optional<CmsPageContent> findByPageIdAndLocale(UUID pageId, String locale);

	@Query("""
			select c from CmsPageContent c
			join c.page p
			where p.active = true
			  and p.pageKey = :pageKey
			  and c.published = true
			  and c.locale = :locale
			""")
	Optional<CmsPageContent> findPublishedByPageKeyAndLocale(
			@Param("pageKey") String pageKey,
			@Param("locale") String locale
	);
}
