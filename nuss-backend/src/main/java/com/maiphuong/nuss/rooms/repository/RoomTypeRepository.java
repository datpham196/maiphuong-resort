package com.maiphuong.nuss.rooms.repository;

import com.maiphuong.nuss.rooms.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {

	Optional<RoomType> findByExternalId(String externalId);

	List<RoomType> findByHotelIdAndActiveTrue(String hotelId);

	List<RoomType> findAllByOrderByNameAsc();
}
