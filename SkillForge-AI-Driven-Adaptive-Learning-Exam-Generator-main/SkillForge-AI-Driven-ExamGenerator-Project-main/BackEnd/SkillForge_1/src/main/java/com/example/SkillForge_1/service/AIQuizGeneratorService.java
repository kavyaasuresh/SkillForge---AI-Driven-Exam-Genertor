//package com.example.SkillForge_1.service;
//import com.example.SkillForge_1.model.Quiz;
//import com.example.SkillForge_1.model.QuizQuestion;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.http.*;
//
//import java.util.*;
//
//@Service
//public class AIQuizGeneratorService {
//
//    @Value("${gemini.api.key}")
//    private String geminiApiKey;
//
//    @Value("${gemini.model}")
//    private String geminiModel;
//
//    public List<QuizQuestion> generateQuestions(Quiz quiz) {
//        List<QuizQuestion> questions = new ArrayList<>();
//
//        // Prompt to Gemini
//        String prompt = "Generate 5 EASY multiple-choice questions for the topic: "
//                + quiz.getTitle()
//                + ". Return ONLY valid JSON array like: "
//                + "[{ \"questionText\": \"...\", \"options\": [\"A\",\"B\",\"C\",\"D\"], \"correctAnswer\": \"A\" }]";
//
//        RestTemplate restTemplate = new RestTemplate();
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.set("Authorization", "Bearer " + geminiApiKey);
//
//        Map<String, Object> body = new HashMap<>();
//        body.put("model", geminiModel);
//        body.put("prompt", prompt);
//        body.put("temperature", 0.7);
//        body.put("max_output_tokens", 500);
//
//        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
//
//        try {
//            ResponseEntity<String> response = restTemplate.postForEntity(
//                    "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent",
//                    request,
//                    String.class
//            );
//
//            String json = response.getBody();
//            ObjectMapper mapper = new ObjectMapper();
//            List<Map<String, Object>> aiQuestions = mapper.readValue(json, List.class);
//
//            for (Map<String, Object> aiQ : aiQuestions) {
//                QuizQuestion q = new QuizQuestion();
//                q.setQuestion((String) aiQ.get("questionText"));
//                q.setType("MCQ"); // always MCQ for now
//
//                List<String> opts = (List<String>) aiQ.get("options");
//                q.setOptionA(opts.get(0));
//                q.setOptionB(opts.get(1));
//                q.setOptionC(opts.get(2));
//                q.setOptionD(opts.get(3));
//
//                q.setCorrectAnswer((String) aiQ.get("correctAnswer"));
//                q.setQuiz(quiz);
//
//                questions.add(q);
//            }
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        return questions;
//    }
//}

//
//    public List<QuizQuestion> generateQuestions(Quiz quiz) {
//
//        List<QuizQuestion> questions = new ArrayList<>();
//
//        // ✅ Strong prompt to force clean JSON
//        String prompt = """
//        Generate 5 EASY multiple-choice questions on the topic: %s.
//
//        Rules:
//        - Return ONLY valid JSON
//        - No markdown
//        - No explanation
//        - Exactly 4 options per question
//
//        Format:
//        [
//          {
//            "questionText": "Question text",
//            "options": ["A", "B", "C", "D"],
//            "correctAnswer": "A"
//          }
//        ]
//        """.formatted(quiz.getTitle());
//
//        RestTemplate restTemplate = new RestTemplate();
//
//        // ✅ Correct Gemini headers
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        // 🔥 Gemini uses API key as query param, NOT Authorization header
//        String url =
//                "https://generativelanguage.googleapis.com/v1beta/models/"
//                        + geminiModel
//                        + ":generateContent?key="
//                        + geminiApiKey;
//
//        // ✅ Correct Gemini request body
//        Map<String, Object> body = new HashMap<>();
//        body.put("contents", List.of(
//                Map.of(
//                        "parts", List.of(
//                                Map.of("text", prompt)
//                        )
//                )
//        ));
//
//        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
//
//        try {
//            ResponseEntity<String> response =
//                    restTemplate.postForEntity(url, request, String.class);
//
//            String rawResponse = response.getBody();
//
//            System.out.println("========== RAW GEMINI RESPONSE ==========");
//            System.out.println(rawResponse);
//            System.out.println("========================================");
//
//            ObjectMapper mapper = new ObjectMapper();
//
//            // 🔍 Parse Gemini wrapper
//            Map<String, Object> root =
//                    mapper.readValue(rawResponse, Map.class);
//
//            List<Map<String, Object>> candidates =
//                    (List<Map<String, Object>>) root.get("candidates");
//
//            if (candidates == null || candidates.isEmpty()) {
//                System.out.println("❌ No candidates returned by Gemini");
//                return questions;
//            }
//
//            Map<String, Object> content =
//                    (Map<String, Object>) candidates.get(0).get("content");
//
//            List<Map<String, Object>> parts =
//                    (List<Map<String, Object>>) content.get("parts");
//
//            String aiText = (String) parts.get(0).get("text");
//
//            System.out.println("========== EXTRACTED AI JSON ==========");
//            System.out.println(aiText);
//            System.out.println("======================================");
//
//            // ✅ Parse actual JSON array
//            List<Map<String, Object>> aiQuestions =
//                    mapper.readValue(aiText, List.class);
//
//            for (Map<String, Object> aiQ : aiQuestions) {
//
//                QuizQuestion q = new QuizQuestion();
//                q.setQuestion((String) aiQ.get("questionText"));
//                q.setType("MCQ");
//
//                List<String> options =
//                        (List<String>) aiQ.get("options");
//
//                q.setOptionA(options.get(0));
//                q.setOptionB(options.get(1));
//                q.setOptionC(options.get(2));
//                q.setOptionD(options.get(3));
//
//                q.setCorrectAnswer(
//                        (String) aiQ.get("correctAnswer")
//                );
//
//                q.setQuiz(quiz);
//                questions.add(q);
//            }
//
//            System.out.println("✅ AI GENERATED QUESTIONS COUNT: " + questions.size());
//
//        } catch (Exception e) {
//            System.out.println("❌ AI GENERATION FAILED");
//            e.printStackTrace();
//        }
//
//        return questions;
//    }
//}
package com.example.SkillForge_1.service;

import com.example.SkillForge_1.model.Quiz;
import com.example.SkillForge_1.model.QuizQuestion;
import com.example.SkillForge_1.repository.QuizQuestionRepository;
import com.example.SkillForge_1.repository.QuizRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIQuizGeneratorService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model}")
    private String geminiModel;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private QuizRepository quizRepository; // <-- Add this

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;


    /**
     * Generate AI questions for a quiz and save them to the database.
     * Supports MCQ, LONG, and SHORT question types.
     */
//    public List<QuizQuestion> generateQuestions(Quiz quiz) {
//
//        List<QuizQuestion> questions = new ArrayList<>();
//        String type = quiz.getQuestionType(); // MCQ, LONG, SHORT
//        String prompt;
//
//        // ---------------- PROMPT GENERATION ----------------
//        if ("MCQ".equalsIgnoreCase(type)) {
//            prompt = """
//                    Generate 5 EASY multiple-choice questions on the topic: %s.
//
//                    Rules:
//                    - Return ONLY valid JSON
//                    - No markdown
//                    - No explanation
//                    - Exactly 4 options per question
//
//                    Format:
//                    [
//                      {
//                        "questionText": "Question text",
//                        "options": ["A", "B", "C", "D"],
//                        "correctAnswer": "A"
//                      }
//                    ]
//                    """.formatted(quiz.getTitle());
//        } else if ("LONG".equalsIgnoreCase(type)) {
//            prompt = """
//                    Generate 5 LONG ANSWER questions on the topic: %s.
//
//                    Rules:
//                    - Return ONLY valid JSON
//                    - No options
//                    - No correctAnswer
//                    - Each question must require paragraph-length answers
//
//                    Format:
//                    [
//                      {
//                        "questionText": "Explain ..."
//                      }
//                    ]
//                    """.formatted(quiz.getTitle());
//        } else { // SHORT
//            prompt = """
//                    Generate 5 SHORT ANSWER questions on the topic: %s.
//
//                    Rules:
//                    - Return ONLY valid JSON
//                    - No options
//                    - No correctAnswer
//                    - Each answer should be 1–2 lines
//
//                    Format:
//                    [
//                      {
//                        "questionText": "Define ..."
//                      }
//                    ]
//                    """.formatted(quiz.getTitle());
//        }
//
//        // ---------------- API CALL ----------------
//        RestTemplate restTemplate = new RestTemplate();
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        String url =
//                "https://generativelanguage.googleapis.com/v1beta/models/"
//                        + geminiModel
//                        + ":generateContent?key="
//                        + geminiApiKey;
//
//        Map<String, Object> body = new HashMap<>();
//        body.put("contents", List.of(
//                Map.of("role", "user",
//                        "parts", List.of(Map.of("text", prompt)))
//        ));
//        body.put("generationConfig", Map.of(
//                "temperature", 0.2,
//                "response_mime_type", "application/json"
//        ));
//
//        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
//
//        try {
//            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
//            String raw = response.getBody();
//
//            ObjectMapper mapper = new ObjectMapper();
//            Map<String, Object> root = mapper.readValue(raw, Map.class);
//
//            List<Map<String, Object>> candidates = (List<Map<String, Object>>) root.get("candidates");
//            if (candidates == null || candidates.isEmpty()) return questions;
//
//            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
//            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
//            String aiText = (String) parts.get(0).get("text");
//
//            // ---------------- PARSE AI QUESTIONS ----------------
//            List<Map<String, Object>> aiQuestions = mapper.readValue(aiText, List.class);
//
//            for (Map<String, Object> aiQ : aiQuestions) {
//                QuizQuestion q = new QuizQuestion();
//                q.setQuestion((String) aiQ.get("questionText"));
//                q.setType(type);
//                q.setQuiz(quiz);
//
//                if ("MCQ".equalsIgnoreCase(type)) {
//                    List<String> options = (List<String>) aiQ.get("options");
//                    q.setOptionA(options.get(0));
//                    q.setOptionB(options.get(1));
//                    q.setOptionC(options.get(2));
//                    q.setOptionD(options.get(3));
//                    q.setCorrectAnswer((String) aiQ.get("correctAnswer"));
//                }
//
//                // ---------------- SAVE TO DB ----------------
//                q.setType(type);
//                quizQuestionRepository.save(q);
//                questions.add(q);
//            }
//
//            System.out.println("✅ Generated and saved " + questions.size() + " " + type + " questions");
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        return questions;
//    }
    @Transactional
    public List<QuizQuestion> generateQuestions(Quiz quiz, int numQuestions) {
        List<QuizQuestion> questions = new ArrayList<>();
        String type = quiz.getQuestionType();
        String difficulty = quiz.getDifficulty() != null ? quiz.getDifficulty() : "MEDIUM";
        String prompt;

        System.out.println("🚀 Starting AI generation for: " + quiz.getTitle());
        System.out.println("📋 Type: " + type + ", Count: " + numQuestions + ", Difficulty: " + difficulty);
        System.out.println("🔑 API Key present: " + (geminiApiKey != null && !geminiApiKey.isEmpty()));
        System.out.println("🌐 API URL: " + geminiApiUrl);

        // Generate enhanced prompt based on type and difficulty
        if ("MCQ".equalsIgnoreCase(type)) {
            prompt = String.format(
                "Generate exactly %d %s difficulty multiple-choice questions about %s. " +
                "Each question must have exactly 4 options and one correct answer. " +
                "Return ONLY a valid JSON array with no markdown formatting: " +
                "[{\"questionText\": \"What is the primary purpose of...\", \"options\": [\"First option\", \"Second option\", \"Third option\", \"Fourth option\"], \"correctAnswer\": \"A\"}]",
                numQuestions, difficulty.toLowerCase(), quiz.getTitle()
            );
        } else if ("LONG".equalsIgnoreCase(type)) {
            prompt = String.format(
                "Generate exactly %d %s difficulty long answer questions about %s. " +
                "Each question should require detailed explanations. " +
                "Return ONLY a valid JSON array with no markdown formatting: " +
                "[{\"questionText\": \"Explain in detail how...\"}]",
                numQuestions, difficulty.toLowerCase(), quiz.getTitle()
            );
        } else {
            prompt = String.format(
                "Generate exactly %d %s difficulty short answer questions about %s. " +
                "Each question should require brief, specific answers. " +
                "Return ONLY a valid JSON array with no markdown formatting: " +
                "[{\"questionText\": \"Define the term...\"}]",
                numQuestions, difficulty.toLowerCase(), quiz.getTitle()
            );
        }

        System.out.println("📝 Generated prompt: " + prompt.substring(0, Math.min(100, prompt.length())) + "...");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = geminiApiUrl + "?key=" + geminiApiKey;

        System.out.println("🌐 Full API URL: " + url.replace(geminiApiKey, "***"));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
        ));
        body.put("generationConfig", Map.of(
                "temperature", 0.4,
                "maxOutputTokens", 3000,
                "topP", 0.8
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            System.out.println("📤 Sending request to Gemini API...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            String raw = response.getBody();
            
            System.out.println("📥 Raw response received (length: " + (raw != null ? raw.length() : 0) + ")");
            System.out.println("📄 Response preview: " + (raw != null ? raw.substring(0, Math.min(200, raw.length())) : "null"));
            
            if (raw == null || raw.trim().isEmpty()) {
                throw new RuntimeException("Empty response from Gemini API");
            }
            
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> root = mapper.readValue(raw, Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) root.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                System.out.println("❌ No candidates in response");
                throw new RuntimeException("No candidates returned by Gemini API");
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String aiText = (String) parts.get(0).get("text");
            
            System.out.println("🤖 AI generated text: " + aiText.substring(0, Math.min(300, aiText.length())) + "...");
            
            // Clean up the response
            aiText = aiText.replaceAll("```json", "").replaceAll("```", "").trim();
            
            // Find JSON array in the text
            int startIndex = aiText.indexOf('[');
            int endIndex = aiText.lastIndexOf(']');
            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                aiText = aiText.substring(startIndex, endIndex + 1);
            }
            
            System.out.println("🧹 Cleaned JSON: " + aiText.substring(0, Math.min(200, aiText.length())) + "...");
            
            List<Map<String, Object>> aiQuestions = mapper.readValue(aiText, List.class);
            System.out.println("✅ Successfully parsed " + aiQuestions.size() + " questions from AI");

            // Process AI questions
            int questionsToTake = Math.min(aiQuestions.size(), numQuestions);
            
            for (int i = 0; i < questionsToTake; i++) {
                Map<String, Object> aiQ = aiQuestions.get(i);
                QuizQuestion q = new QuizQuestion();
                
                String questionText = (String) aiQ.get("questionText");
                if (questionText == null || questionText.trim().isEmpty()) {
                    System.out.println("⚠️ Skipping question with empty text at index " + i);
                    continue;
                }
                
                q.setQuestion(questionText);
                q.setType(type);
                q.setQuiz(quiz);

                if ("MCQ".equalsIgnoreCase(type)) {
                    List<String> options = (List<String>) aiQ.get("options");
                    String correctAnswer = (String) aiQ.get("correctAnswer");
                    
                    if (options != null && options.size() >= 4 && correctAnswer != null) {
                        q.setOptionA(options.get(0));
                        q.setOptionB(options.get(1));
                        q.setOptionC(options.get(2));
                        q.setOptionD(options.get(3));
                        q.setCorrectAnswer(correctAnswer.toUpperCase());
                        System.out.println("✅ MCQ Question " + (i+1) + ": " + questionText.substring(0, Math.min(50, questionText.length())) + "...");
                    } else {
                        System.out.println("⚠️ Invalid MCQ format at index " + i + ", skipping");
                        continue;
                    }
                } else {
                    System.out.println("✅ " + type + " Question " + (i+1) + ": " + questionText.substring(0, Math.min(50, questionText.length())) + "...");
                }

                questions.add(q);
            }

            System.out.println("🎉 Successfully generated " + questions.size() + " real AI questions!");
            return questions;

        } catch (Exception e) {
            System.out.println("❌ AI generation failed with error: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
            
            // Only use fallback if absolutely necessary
            System.out.println("⚠️ Falling back to sample questions due to API failure");
            return generateFallbackQuestions(quiz, type, numQuestions);
        }
    }
    
    // Keep the old method for backward compatibility
    public List<QuizQuestion> generateQuestions(Quiz quiz) {
        return generateQuestions(quiz, 5); // Default to 5 questions
    }
    
    private List<QuizQuestion> generateFallbackQuestions(Quiz quiz, String type, int numQuestions) {
        List<QuizQuestion> fallbackQuestions = new ArrayList<>();
        
        System.out.println("🔄 Generating fallback questions for: " + quiz.getTitle());
        
        for (int i = 1; i <= numQuestions; i++) {
            QuizQuestion q = new QuizQuestion();
            
            if ("MCQ".equalsIgnoreCase(type)) {
                q.setQuestion("Question " + i + ": What is a key concept in " + quiz.getTitle() + "?");
                q.setOptionA("Basic concept A");
                q.setOptionB("Advanced concept B");
                q.setOptionC("Complex concept C");
                q.setOptionD("Expert concept D");
                q.setCorrectAnswer("A");
            } else if ("LONG".equalsIgnoreCase(type)) {
                q.setQuestion("Question " + i + ": Explain the importance and applications of " + quiz.getTitle() + " in detail.");
            } else {
                q.setQuestion("Question " + i + ": Define a key term related to " + quiz.getTitle() + ".");
            }
            
            q.setType(type);
            q.setQuiz(quiz);
            fallbackQuestions.add(q);
        }
        
        System.out.println("✅ Generated " + fallbackQuestions.size() + " fallback questions");
        return fallbackQuestions;
    }

    public String generateStudySuggestions(Map<String, Object> request) {
        String quizTitle = (String) request.getOrDefault("quizTitle", "the subject");
        Object score = request.get("score");
        Object totalMarks = request.get("totalMarks");
        Object percentageObj = request.get("percentage");
        int percentage = 0;
        if (percentageObj instanceof Number) {
            percentage = ((Number) percentageObj).intValue();
        }

        List<Map<String, Object>> incorrectQuestions = (List<Map<String, Object>>) request.getOrDefault("incorrectQuestions", new ArrayList<>());
        
        StringBuilder analysisBuilder = new StringBuilder();
        if (!incorrectQuestions.isEmpty()) {
            analysisBuilder.append("\nHere are the specific questions the student got wrong:\n");
            for (int i = 0; i < incorrectQuestions.size(); i++) {
                Map<String, Object> q = incorrectQuestions.get(i);
                analysisBuilder.append(String.format("%d. Question: %s\n   Student's Answer: %s\n   Correct Answer: %s\n", 
                    i + 1, q.get("question"), q.get("studentAnswer"), q.get("correctAnswer")));
            }
        }

        String performanceLevel;
        if (percentage >= 85) performanceLevel = "EXCELLENT (Mastery)";
        else if (percentage >= 70) performanceLevel = "GOOD (Solid understanding but needs polish)";
        else if (percentage >= 50) performanceLevel = "AVERAGE (Foundational gaps present)";
        else performanceLevel = "POOR (Significant remedial work needed)";

        String prompt = String.format(
            "Act as a high-level academic performance analyst and tutor. Analyze this student's quiz attempt and provide unique, real-time, data-driven study tips.\n\n" +
            "CONTEXT:\n" +
            "- Quiz Topic: %s\n" +
            "- Score: %s/%s (%d%%)\n" +
            "- Performance Level: %s\n" +
            "%s\n\n" +
            "INSTRUCTIONS:\n" +
            "1. provide 3-4 highly specific study actions based ON THE ACTUAL MISTAKES above. Don't just give general advice.\n" +
            "2. If they got MCQs wrong involving specific keywords, tell them to define those keywords.\n" +
            "3. If they gave no answer, suggest time management or confidence-building strategies.\n" +
            "4. NEVER repeat the same tip. Every tip must feel like it was written just for this specific attempt.\n" +
            "5. Based on the performance level, suggest whether they should (RE-WATCH LECTURES, PRACTICE DRILLS, or ADVANCE TO COMPLEX TOPICS).\n" +
            "6. Use **bolding** for key terms. Format with double newlines between tips.\n" +
            "7. NO generic intro like 'Here are some tips'. Start directly with the analysis.",
            quizTitle, score, totalMarks, percentage, performanceLevel, analysisBuilder.toString()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(
            Map.of("parts", List.of(Map.of("text", prompt)))
        ));
        body.put("generationConfig", Map.of(
            "temperature", 0.7, // Higher temperature for more variety/uniqueness
            "candidateCount", 1
        ));

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> root = mapper.readValue(response.getBody(), Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) root.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            return "**Quick Analysis:** You scored " + percentage + "%. Focus on reviewing the specific questions you missed in " + quizTitle + ". Pay close attention to the correct answers provided in the transcript above. Try to identify the 'why' behind the correct choice before your next attempt.";
        }
    }

}
