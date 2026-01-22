package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.QuizAnalyticsDTO;
import com.example.SkillForge_1.model.QuestionEvaluationStatus;
import com.example.SkillForge_1.model.StudentQuestionResponse;
import com.example.SkillForge_1.repository.StudentQuestionResponseRepository;
import com.example.SkillForge_1.service.QuizAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/instructor/quiz")
public class InstructorQuizAnalyticsController {

    private final QuizAnalyticsService analyticsService;

    public InstructorQuizAnalyticsController(QuizAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * GET /api/instructor/quiz/{quizId}/analytics
     */
    @GetMapping("/{quizId}/analytics")
    public ResponseEntity<QuizAnalyticsDTO> getQuizAnalytics(
            @PathVariable Long quizId) {

        return ResponseEntity.ok(
                analyticsService.getQuizAnalytics(quizId)
        );
    }
    @GetMapping("/{quizId}/details")
    public QuizAnalyticsDTO getQuizDetails(@PathVariable Long quizId) {
        return analyticsService.getQuizDetails(quizId);
    }
}
