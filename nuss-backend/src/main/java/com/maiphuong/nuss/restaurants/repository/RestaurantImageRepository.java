package com.maiphuong.nuss.restaurants.repository;

import com.maiphuong.nuss.restaurants.entity.RestaurantImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantImageRepository extends JpaRepository<RestaurantImage, UUID> {

	List<RestaurantImage> findByRestaurantIdOrderByRoleAscDisplayOrderAsc(UUID restaurantId);

	List<RestaurantImage> findByRestaurantIdAndRoleOrderByDisplayOrderAsc(UUID restaurantId, String role);

	Optional<RestaurantImage> findByIdAndRestaurantId(UUID id, UUID restaurantId);

	long countByRestaurantIdAndRole(UUID restaurantId, String role);
}
