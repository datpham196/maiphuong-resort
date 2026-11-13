package com.maiphuong.nuss.experiences.repository;

import com.maiphuong.nuss.experiences.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExperienceRepository extends JpaRepository<Experience, UUID> {

	List<Experience> findAllByOrderByExperienceGroupAscDisplayOrderAsc();
}
