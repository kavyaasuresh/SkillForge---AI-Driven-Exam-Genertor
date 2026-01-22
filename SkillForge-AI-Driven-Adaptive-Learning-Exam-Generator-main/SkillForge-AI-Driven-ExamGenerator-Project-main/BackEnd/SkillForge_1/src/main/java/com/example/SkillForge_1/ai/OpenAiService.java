package com.example.SkillForge_1.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate rt = new RestTemplate();

    public String refineDifficultySuggestion(double averageScore, String heuristicSuggestion) {
        if (apiKey == null || apiKey.isBlank()) {
            return heuristicSuggestion; // no API key configured
        }

        String prompt = String.format("A student has average score %.1f. Current suggested difficulty: %s. Reply with only one word: Easy, Medium, or Hard.", averageScore, heuristicSuggestion);

        String url = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
        ));
        body.put("generationConfig", Map.of(
                "temperature", 0.2,
                "maxOutputTokens", 10
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> resp = rt.postForEntity(url, request, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return heuristicSuggestion;
            
            Map<?,?> b = resp.getBody();
            List<?> candidates = (List<?>) b.get("candidates");
            if (candidates == null || candidates.isEmpty()) return heuristicSuggestion;
            
            Map<?,?> first = (Map<?,?>) candidates.get(0);
            Map<?,?> content = (Map<?,?>) first.get("content");
            List<?> parts = (List<?>) content.get("parts");
            if (parts == null || parts.isEmpty()) return heuristicSuggestion;
            
            Map<?,?> firstPart = (Map<?,?>) parts.get(0);
            String responseText = (String) firstPart.get("text");
            
            if (responseText == null) return heuristicSuggestion;
            String cleaned = responseText.trim().split("\\s+")[0];
            if (cleaned.equalsIgnoreCase("Easy") || cleaned.equalsIgnoreCase("Medium") || cleaned.equalsIgnoreCase("Hard")) return cleaned;
            return heuristicSuggestion;
        } catch (Exception e) {
            System.out.println("Error in difficulty suggestion: " + e.getMessage());
            return heuristicSuggestion;
        }
    }
}
