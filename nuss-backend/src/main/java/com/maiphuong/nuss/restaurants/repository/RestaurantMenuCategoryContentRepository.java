package com.maiphuong.nuss.restaurants.repository;

import com.maiphuong.nuss.restaurants.entity.RestaurantMenuCategoryContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantMenuCategoryContentRepository extends JpaRepository<RestaurantMenuCategoryContent, UUID> {

	List<RestaurantMenuCategoryContent> findByCategoryId(UUID categoryId);

	Optional<RestaurantMenuCategoryContent> findByCategoryIdAndLocale(UUID categoryId, String locale);
}
