package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.AIRequestDTO;
import com.example.SkillForge_1.model.Quiz;
import com.example.SkillForge_1.model.QuizQuestion;
import com.example.SkillForge_1.service.AIQuizGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
public class AIController {

    @Autowired
    private AIQuizGeneratorService aiQuizGeneratorService;

    @PostMapping("/generate-quiz")
    public List<QuizQuestion> generateQuiz(@RequestBody AIRequestDTO request) {
        List<QuizQuestion> allQuestions = new ArrayList<>();
        
        if ("MIXED".equalsIgnoreCase(request.getQuestionType())) {
            // Generate MCQ questions
            if (request.getNumMcqQuestions() > 0) {
                Quiz mcqQuiz = new Quiz();
                mcqQuiz.setTitle(request.getTopicName());
                mcqQuiz.setDifficulty(request.getDifficulty());
                mcqQuiz.setQuestionType("MCQ");
                List<QuizQuestion> mcqQuestions = aiQuizGeneratorService.generateQuestions(mcqQuiz, request.getNumMcqQuestions());
                allQuestions.addAll(mcqQuestions);
            }
            
            // Generate Long Answer questions
            if (request.getNumLongQuestions() > 0) {
                Quiz longQuiz = new Quiz();
                longQuiz.setTitle(request.getTopicName());
                longQuiz.setDifficulty(request.getDifficulty());
                longQuiz.setQuestionType("LONG");
                List<QuizQuestion> longQuestions = aiQuizGeneratorService.generateQuestions(longQuiz, request.getNumLongQuestions());
                allQuestions.addAll(longQuestions);
            }
        } else {
            // Single type generation
            Quiz tempQuiz = new Quiz();
            tempQuiz.setTitle(request.getTopicName());
            tempQuiz.setDifficulty(request.getDifficulty());
            tempQuiz.setQuestionType(request.getQuestionType());
            allQuestions = aiQuizGeneratorService.generateQuestions(tempQuiz, request.getNumQuestions());
        }
        
        return allQuestions;
    }

    @PostMapping("/study-suggestions")
    public String getStudySuggestions(@RequestBody java.util.Map<String, Object> request) {
        return aiQuizGeneratorService.generateStudySuggestions(request);
    }
}