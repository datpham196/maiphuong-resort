package com.maiphuong.nuss.rooms.repository;

import com.maiphuong.nuss.rooms.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomImageRepository extends JpaRepository<RoomImage, UUID> {

	List<RoomImage> findByRoomTypeIdOrderByDisplayOrderAsc(UUID roomTypeId);

	Optional<RoomImage> findByIdAndRoomTypeId(UUID id, UUID roomTypeId);

	Optional<RoomImage> findFirstByRoomTypeIdAndCoverTrue(UUID roomTypeId);

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update RoomImage i set i.cover = false where i.roomType.id = :roomTypeId")
	void clearCover(@Param("roomTypeId") UUID roomTypeId);

	long countByRoomTypeId(UUID roomTypeId);
}
