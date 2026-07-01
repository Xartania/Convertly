package com.convertly.backend.controller;

import com.convertly.backend.dto.AuthDtos.LoginRequest;
import com.convertly.backend.dto.AuthDtos.RegisterRequest;
import com.convertly.backend.dto.AuthDtos.UserResponse;
import com.convertly.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    private final UserService users;

    public AuthController(UserService users) {
        this.users = users;
    }

    @PostMapping("/api/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return UserResponse.from(users.register(request));
    }

    @PostMapping("/api/auth/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = users.authenticate(request);
        return UserResponse.from(users.requireCurrentUser(authentication));
    }

    @PostMapping("/api/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        // Stateless HTTP Basic logout is handled by the client dropping credentials.
    }

    @GetMapping("/api/users/me")
    public UserResponse me(Authentication authentication) {
        return UserResponse.from(users.requireCurrentUser(authentication));
    }
}
