package com.convertly.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class ToolDtos {
    private ToolDtos() {
    }

    public record ToolOptions(
        @NotBlank String language,
        @NotBlank String tone,
        @NotBlank String length,
        @NotBlank String outputFormat,
        boolean preserveFormatting
    ) {
    }

    public record ToolRunRequest(
        @NotBlank @Size(max = 200000) String source,
        @NotBlank @Size(max = 10000) String instruction,
        @Valid @NotNull ToolOptions options
    ) {
    }

    public record ToolRunResponse(
        String source,
        String instruction,
        String output,
        String originalOutput,
        ToolOptions options,
        String status
    ) {
    }
}
