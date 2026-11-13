package com.maiphuong.nuss.rooms.repository;

import com.maiphuong.nuss.rooms.entity.RoomContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomContentRepository extends JpaRepository<RoomContent, UUID> {

	Optional<RoomContent> findByRoomTypeIdAndLocale(UUID roomTypeId, String locale);

	List<RoomContent> findByRoomTypeId(UUID roomTypeId);

	Optional<RoomContent> findByLocaleAndSlugAndPublishedTrue(String locale, String slug);

	@Query("""
			select c from RoomContent c
			join fetch c.roomType rt
			where rt.active = true
			  and c.published = true
			  and c.locale = :locale
			  and c.slug is not null
			order by c.displayOrder asc, rt.name asc
			""")
	List<RoomContent> findPublishedByLocale(@Param("locale") String locale);

	boolean existsByLocaleAndSlugAndRoomTypeIdNot(String locale, String slug, UUID roomTypeId);
}
