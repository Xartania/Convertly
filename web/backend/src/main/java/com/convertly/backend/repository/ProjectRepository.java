package com.convertly.backend.repository;

import com.convertly.backend.entity.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    Optional<Project> findByIdAndOwnerId(UUID id, UUID ownerId);
}
