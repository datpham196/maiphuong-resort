package com.maiphuong.nuss.restaurants.repository;

import com.maiphuong.nuss.restaurants.entity.RestaurantMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantMenuItemRepository extends JpaRepository<RestaurantMenuItem, UUID> {

	List<RestaurantMenuItem> findByRestaurantIdOrderByDisplayOrderAsc(UUID restaurantId);

	List<RestaurantMenuItem> findByRestaurantIdAndActiveTrueOrderByDisplayOrderAsc(UUID restaurantId);

	List<RestaurantMenuItem> findByCategoryIdOrderByDisplayOrderAsc(UUID categoryId);

	Optional<RestaurantMenuItem> findByIdAndRestaurantId(UUID id, UUID restaurantId);
}
