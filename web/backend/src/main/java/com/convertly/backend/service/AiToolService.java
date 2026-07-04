package com.convertly.backend.service;

import com.convertly.backend.dto.ToolDtos.ToolOptions;
import com.convertly.backend.dto.ToolDtos.ToolRunRequest;
import com.convertly.backend.dto.ToolDtos.ToolRunResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiToolService {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String apiUrl;
    private final String model;

    public AiToolService(
        ObjectMapper objectMapper,
        @Value("${convertly.ai.api-key:}") String apiKey,
        @Value("${convertly.ai.api-url:https://api.groq.com/openai/v1/chat/completions}") String apiUrl,
        @Value("${convertly.ai.model:llama-3.1-8b-instant}") String model
    ) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public ToolRunResponse run(ToolRunRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "AI API key is not configured. Set GROQ_API_KEY before starting the backend."
            );
        }

        String output = callProvider(request);
        return new ToolRunResponse(
            request.source(),
            request.instruction(),
            output,
            output,
            request.options(),
            "completed"
        );
    }

    private String callProvider(ToolRunRequest request) {
        try {
            String body = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "temperature", 0.2,
                "messages", List.of(
                    Map.of(
                        "role", "system",
                        "content", buildSystemPrompt(request.options())
                    ),
                    Map.of(
                        "role", "user",
                        "content", buildUserPrompt(request)
                    )
                )
            ));

            HttpRequest httpRequest = HttpRequest.newBuilder(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(45))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> response = httpClient.send(
                httpRequest,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "AI provider request failed with status " + response.statusCode()
                );
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText();

            if (content == null || content.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI provider returned an empty response");
            }

            return content.trim();
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI provider response could not be read", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI provider request was interrupted", exception);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider URL is invalid", exception);
        }
    }

    private String buildSystemPrompt(ToolOptions options) {
        return """
            You are Convertly's transformation engine.
            Follow the user's instruction exactly.
            Return only the final transformed content, with no explanations unless requested.
            Language: %s
            Tone: %s
            Length: %s
            Output format: %s
            Preserve formatting when requested: %s
            """.formatted(
            options.language(),
            options.tone(),
            options.length(),
            options.outputFormat(),
            options.preserveFormatting()
        );
    }

    private String buildUserPrompt(ToolRunRequest request) {
        return """
            Instruction:
            %s

            Source:
            %s
            """.formatted(request.instruction(), request.source());
    }
}
