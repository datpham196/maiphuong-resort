package com.maiphuong.nuss.experiences.repository;

import com.maiphuong.nuss.experiences.entity.ExperienceContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExperienceContentRepository extends JpaRepository<ExperienceContent, UUID> {

	Optional<ExperienceContent> findByExperienceIdAndLocale(UUID experienceId, String locale);

	List<ExperienceContent> findByExperienceId(UUID experienceId);

	Optional<ExperienceContent> findByLocaleAndSlugAndPublishedTrue(String locale, String slug);

	boolean existsByLocaleAndSlugAndExperienceIdNot(String locale, String slug, UUID experienceId);

	@Query("""
			select c from ExperienceContent c
			join fetch c.experience e
			where e.active = true
			  and c.published = true
			  and c.locale = :locale
			  and c.slug is not null
			  and (:group is null or e.experienceGroup = :group)
			order by e.experienceGroup asc, e.displayOrder asc, c.title asc
			""")
	List<ExperienceContent> findPublished(@Param("locale") String locale, @Param("group") String group);
}
