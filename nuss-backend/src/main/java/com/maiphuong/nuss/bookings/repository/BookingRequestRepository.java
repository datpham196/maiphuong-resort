package com.maiphuong.nuss.bookings.repository;

import com.maiphuong.nuss.bookings.entity.BookingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookingRequestRepository extends JpaRepository<BookingRequest, UUID> {

	Optional<BookingRequest> findByRequestCode(String requestCode);

	boolean existsByRequestCode(String requestCode);
}
