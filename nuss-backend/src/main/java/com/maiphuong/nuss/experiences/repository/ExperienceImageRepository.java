package com.maiphuong.nuss.experiences.repository;

import com.maiphuong.nuss.experiences.entity.ExperienceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExperienceImageRepository extends JpaRepository<ExperienceImage, UUID> {

	List<ExperienceImage> findByExperienceIdOrderByDisplayOrderAsc(UUID experienceId);

	Optional<ExperienceImage> findByIdAndExperienceId(UUID id, UUID experienceId);

	Optional<ExperienceImage> findFirstByExperienceIdAndCoverTrue(UUID experienceId);

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update ExperienceImage i set i.cover = false where i.experience.id = :experienceId")
	void clearCover(@Param("experienceId") UUID experienceId);

	long countByExperienceId(UUID experienceId);
}
