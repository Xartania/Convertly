package com.convertly.backend.controller;

import com.convertly.backend.dto.ProjectDtos.ProjectRequest;
import com.convertly.backend.dto.ProjectDtos.ProjectResponse;
import com.convertly.backend.entity.User;
import com.convertly.backend.service.ProjectService;
import com.convertly.backend.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projects;
    private final UserService users;

    public ProjectController(ProjectService projects, UserService users) {
        this.projects = projects;
        this.users = users;
    }

    @GetMapping
    public List<ProjectResponse> list(Authentication authentication) {
        User owner = users.requireCurrentUser(authentication);
        return projects.listFor(owner).stream().map(ProjectResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse create(
        Authentication authentication,
        @Valid @RequestBody ProjectRequest request
    ) {
        User owner = users.requireCurrentUser(authentication);
        return ProjectResponse.from(projects.create(owner, request));
    }

    @GetMapping("/{projectId}")
    public ProjectResponse get(Authentication authentication, @PathVariable UUID projectId) {
        User owner = users.requireCurrentUser(authentication);
        return ProjectResponse.from(projects.getFor(owner, projectId));
    }

    @DeleteMapping("/{projectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication, @PathVariable UUID projectId) {
        User owner = users.requireCurrentUser(authentication);
        projects.deleteFor(owner, projectId);
    }
}
