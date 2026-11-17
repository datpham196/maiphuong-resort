package com.maiphuong.nuss.restaurants.repository;

import com.maiphuong.nuss.restaurants.entity.RestaurantMenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantMenuCategoryRepository extends JpaRepository<RestaurantMenuCategory, UUID> {

	List<RestaurantMenuCategory> findByRestaurantIdOrderByDisplayOrderAsc(UUID restaurantId);

	List<RestaurantMenuCategory> findByRestaurantIdAndActiveTrueOrderByDisplayOrderAsc(UUID restaurantId);

	Optional<RestaurantMenuCategory> findByIdAndRestaurantId(UUID id, UUID restaurantId);
}
