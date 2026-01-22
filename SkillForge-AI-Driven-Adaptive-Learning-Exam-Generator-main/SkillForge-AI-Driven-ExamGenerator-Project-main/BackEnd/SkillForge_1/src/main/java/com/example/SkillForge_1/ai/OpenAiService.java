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

    @Value("${openai.api.key:}")
    private String apiKey;

    private final RestTemplate rt = new RestTemplate();

    public String refineDifficultySuggestion(double averageScore, String heuristicSuggestion) {
        if (apiKey == null || apiKey.isBlank()) {
            return heuristicSuggestion; // no API key configured
        }

        String prompt = String.format("A student has average score %.1f. Current suggested difficulty: %s. Reply with only one word: Easy, Medium, or Hard.", averageScore, heuristicSuggestion);

        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-3.5-turbo");
        body.put("messages", List.of(message));
        body.put("max_tokens", 10);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> resp = rt.postForEntity(url, request, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return heuristicSuggestion;
            Map<?,?> b = resp.getBody();
            List<?> choices = (List<?>) b.get("choices");
            if (choices == null || choices.isEmpty()) return heuristicSuggestion;
            Map<?,?> first = (Map<?,?>) choices.get(0);
            Map<?,?> messageResp = (Map<?,?>) first.get("message");
            String content = (String) messageResp.get("content");
            if (content == null) return heuristicSuggestion;
            String cleaned = content.trim().split("\\s+")[0];
            if (cleaned.equalsIgnoreCase("Easy") || cleaned.equalsIgnoreCase("Medium") || cleaned.equalsIgnoreCase("Hard")) return cleaned;
            return heuristicSuggestion;
        } catch (Exception e) {
            return heuristicSuggestion;
        }
    }
}
