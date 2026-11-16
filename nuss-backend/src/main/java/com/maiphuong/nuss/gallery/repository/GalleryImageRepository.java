package com.maiphuong.nuss.gallery.repository;

import com.maiphuong.nuss.gallery.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, UUID> {

	List<GalleryImage> findAllByOrderByDisplayOrderAscCreatedAtAsc();

	List<GalleryImage> findByActiveTrueOrderByDisplayOrderAscCreatedAtAsc();

	@Query("select coalesce(max(g.displayOrder), 0) from GalleryImage g")
	int findMaxDisplayOrder();
}
