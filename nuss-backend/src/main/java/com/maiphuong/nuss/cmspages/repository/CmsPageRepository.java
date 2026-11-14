package com.maiphuong.nuss.cmspages.repository;

import com.maiphuong.nuss.cmspages.entity.CmsPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CmsPageRepository extends JpaRepository<CmsPage, UUID> {

	Optional<CmsPage> findByPageKey(String pageKey);
}
