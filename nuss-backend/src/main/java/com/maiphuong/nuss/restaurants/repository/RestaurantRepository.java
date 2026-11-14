package com.maiphuong.nuss.restaurants.repository;

import com.maiphuong.nuss.restaurants.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {

	List<Restaurant> findAllByOrderByDisplayOrderAsc();

	List<Restaurant> findByActiveTrueOrderByDisplayOrderAsc();

	List<Restaurant> findByKindOrderByDisplayOrderAsc(String kind);
}
