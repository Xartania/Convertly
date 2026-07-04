package com.convertly.backend.exception;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiError("not_found", exception.getMessage(), Instant.now(), Map.of()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ApiError("conflict", exception.getMessage(), Instant.now(), Map.of()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ApiError("unauthorized", "Invalid email or password", Instant.now(), Map.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = exception.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(
                java.util.stream.Collectors.toMap(
                    FieldError::getField,
                    error -> error.getDefaultMessage() == null ? "invalid" : error.getDefaultMessage(),
                    (left, right) -> left
                )
            );

        return ResponseEntity.badRequest()
            .body(new ApiError("validation_failed", "Request validation failed", Instant.now(), fields));
    }

    public record ApiError(String code, String message, Instant timestamp, Map<String, String> fields) {
    }
}
