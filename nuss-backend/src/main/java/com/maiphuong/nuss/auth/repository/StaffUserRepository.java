package com.maiphuong.nuss.auth.repository;

import com.maiphuong.nuss.auth.entity.StaffUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StaffUserRepository extends JpaRepository<StaffUser, UUID> {

	Optional<StaffUser> findByUsername(String username);

	boolean existsByUsername(String username);
}
