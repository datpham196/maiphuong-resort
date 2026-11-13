package com.maiphuong.nuss.rooms.repository;

import com.maiphuong.nuss.rooms.entity.PmsSyncRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PmsSyncRunRepository extends JpaRepository<PmsSyncRun, UUID> {

	boolean existsByStatus(PmsSyncRun.Status status);

	List<PmsSyncRun> findTop20ByOrderByStartedAtDesc();

	Optional<PmsSyncRun> findFirstByOrderByStartedAtDesc();
}
