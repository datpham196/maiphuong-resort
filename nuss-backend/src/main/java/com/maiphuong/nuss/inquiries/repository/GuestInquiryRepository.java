package com.maiphuong.nuss.inquiries.repository;

import com.maiphuong.nuss.inquiries.entity.GuestInquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GuestInquiryRepository extends JpaRepository<GuestInquiry, UUID> {

	List<GuestInquiry> findAllByOrderByCreatedAtDesc();

	List<GuestInquiry> findByStatusOrderByCreatedAtDesc(String status);
}
