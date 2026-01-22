package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.QuizAnalyticsDTO;
import com.example.SkillForge_1.service.QuizAnalyticsService;
import com.example.SkillForge_1.service.QuizService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    private final QuizAnalyticsService quizAnalyticsService;
    private final QuizService quizService;

    public QuizController(QuizAnalyticsService quizAnalyticsService, QuizService quizService) {
        this.quizAnalyticsService = quizAnalyticsService;
        this.quizService = quizService;
    }

    @GetMapping("/{quizId}/details")
    public Object getQuizDetails(@PathVariable Long quizId) {
        try {
            return quizService.getQuizDetails(quizId);
        } catch (Exception e) {
            // Return minimal fallback data
            final Long qId = quizId;
            return new Object() {
                public final Long quizId = qId;
                public final String title = "Quiz " + quizId;
                public final String difficulty = "MEDIUM";
                public final Integer totalMarks = 0;
                public final Long topicId = null;
                public final java.util.List<Object> questions = new java.util.ArrayList<>();
                public final java.util.List<Object> assignedStudents = new java.util.ArrayList<>();
                public final java.util.List<Object> attempts = new java.util.ArrayList<>();
                public final int totalAssigned = 0;
                public final int totalAttempted = 0;
            };
        }
    }
    
    @GetMapping("/{quizId}/analytics")
    public Object getQuizAnalytics(@PathVariable Long quizId) {
        try {
            return quizAnalyticsService.getQuizAnalytics(quizId);
        } catch (Exception e) {
            // Return minimal fallback data
            final Long qId = quizId;
            return new Object() {
                public final Long quizId = qId;
                public final String title = "Quiz " + quizId;
                public final String difficulty = "MEDIUM";
                public final Integer totalMarks = 0;
                public final Long topicId = null;
                public final java.util.List<Object> questions = new java.util.ArrayList<>();
                public final java.util.List<Object> assignedStudents = new java.util.ArrayList<>();
                public final java.util.List<Object> attempts = new java.util.ArrayList<>();
                public final int totalAssigned = 0;
                public final int totalAttempted = 0;
            };
        }
    }
}
