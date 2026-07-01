package com.convertly.backend.service;

import com.convertly.backend.dto.AuthDtos.LoginRequest;
import com.convertly.backend.dto.AuthDtos.RegisterRequest;
import com.convertly.backend.entity.User;
import com.convertly.backend.exception.ConflictException;
import com.convertly.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UserService(
        UserRepository users,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setDisplayName(request.displayName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        return users.save(user);
    }

    public Authentication authenticate(LoginRequest request) {
        return authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
    }

    public User requireCurrentUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(() -> new IllegalStateException("Authenticated user is missing from the database"));
    }
}
