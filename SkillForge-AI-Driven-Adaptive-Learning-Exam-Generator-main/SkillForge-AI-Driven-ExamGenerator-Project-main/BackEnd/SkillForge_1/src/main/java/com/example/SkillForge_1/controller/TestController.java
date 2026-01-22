package com.example.SkillForge_1.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin("*")
public class TestController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model}")
    private String geminiModel;

    @GetMapping("/gemini")
    public ResponseEntity<Map<String, Object>> testGeminiConnection() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Simple test prompt
            String prompt = "Generate a simple JSON object with a greeting message.";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = "https://generativelanguage.googleapis.com/v1/models/" +
                    geminiModel + ":generateContent?key=" + geminiApiKey;

            Map<String, Object> body = new HashMap<>();
            body.put("contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
            ));
            body.put("generationConfig", Map.of(
                    "temperature", 0.4,
                    "maxOutputTokens", 100
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            result.put("status", "SUCCESS");
            result.put("message", "Gemini API is working correctly");
            result.put("responseStatus", response.getStatusCode());
            result.put("hasResponse", response.getBody() != null);
            result.put("apiKeyConfigured", geminiApiKey != null && !geminiApiKey.isEmpty());
            result.put("model", geminiModel);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", "Gemini API test failed: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
            result.put("apiKeyConfigured", geminiApiKey != null && !geminiApiKey.isEmpty());
            result.put("model", geminiModel);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
}