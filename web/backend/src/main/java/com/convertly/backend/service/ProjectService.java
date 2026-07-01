package com.convertly.backend.service;

import com.convertly.backend.dto.ProjectDtos.ProjectRequest;
import com.convertly.backend.entity.Project;
import com.convertly.backend.entity.User;
import com.convertly.backend.exception.ResourceNotFoundException;
import com.convertly.backend.repository.ProjectRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {
    private final ProjectRepository projects;

    public ProjectService(ProjectRepository projects) {
        this.projects = projects;
    }

    @Transactional(readOnly = true)
    public List<Project> listFor(User owner) {
        return projects.findAllByOwnerIdOrderByCreatedAtDesc(owner.getId());
    }

    @Transactional
    public Project create(User owner, ProjectRequest request) {
        Project project = new Project();
        project.setOwner(owner);
        project.setName(request.name().trim());
        project.setDescription(normalizeOptional(request.description()));
        return projects.save(project);
    }

    @Transactional(readOnly = true)
    public Project getFor(User owner, UUID projectId) {
        return projects.findByIdAndOwnerId(projectId, owner.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    @Transactional
    public void deleteFor(User owner, UUID projectId) {
        Project project = getFor(owner, projectId);
        projects.delete(project);
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
