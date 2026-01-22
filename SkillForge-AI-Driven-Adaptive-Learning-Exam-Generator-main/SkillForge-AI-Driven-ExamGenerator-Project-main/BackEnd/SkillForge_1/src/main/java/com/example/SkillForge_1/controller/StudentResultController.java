package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.QuizResultDTO;
import com.example.SkillForge_1.dto.QuizResultSummaryDTO;
import com.example.SkillForge_1.service.QuizResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/quiz/result")
public class StudentResultController {

    @Autowired
    private QuizResultService quizResultService;

    // ------------------ Quick Result ------------------
    @GetMapping("/quick/student/{quizId}")
    public QuizResultDTO getQuickResultForStudent(@PathVariable Long quizId, Principal principal) {
        return quizResultService.getQuickResultByQuizAndStudent(quizId, principal.getName());
    }

    // ------------------ Full Summary ------------------
    @GetMapping("/summary/student/{quizId}")
    public QuizResultSummaryDTO getFullSummaryForStudent(@PathVariable Long quizId, Principal principal) {
        return quizResultService.getFullSummaryByQuizAndStudent(quizId, principal.getName());
    }
}
