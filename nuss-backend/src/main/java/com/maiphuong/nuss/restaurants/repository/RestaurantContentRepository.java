package com.maiphuong.nuss.restaurants.repository;

import com.maiphuong.nuss.restaurants.entity.RestaurantContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantContentRepository extends JpaRepository<RestaurantContent, UUID> {

	List<RestaurantContent> findByRestaurantId(UUID restaurantId);

	Optional<RestaurantContent> findByRestaurantIdAndLocale(UUID restaurantId, String locale);

	@Query("""
			select c from RestaurantContent c
			join c.restaurant r
			where r.active = true
			  and c.published = true
			  and c.locale = :locale
			  and c.slug = :slug
			""")
	Optional<RestaurantContent> findPublishedBySlugAndLocale(@Param("slug") String slug, @Param("locale") String locale);

	@Query("""
			select c from RestaurantContent c
			join c.restaurant r
			where r.active = true
			  and c.published = true
			  and c.locale = :locale
			order by r.displayOrder asc
			""")
	List<RestaurantContent> findPublishedByLocale(@Param("locale") String locale);

	boolean existsByLocaleAndSlugAndRestaurantIdNot(String locale, String slug, UUID restaurantId);
}
