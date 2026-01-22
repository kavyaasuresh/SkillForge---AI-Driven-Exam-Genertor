package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.QuizQuestionDTO;
import com.example.SkillForge_1.dto.StudentQuizDTO;
import com.example.SkillForge_1.dto.QuizAnalyticsDTO;
import com.example.SkillForge_1.model.Quiz;
import com.example.SkillForge_1.model.StudentQuizAttempt;

import java.util.List;
import java.util.Map;

public interface QuizService {
    List<StudentQuizDTO> getStudentQuizzes(String email);
    List<QuizQuestionDTO> getQuestions(Long quizId);
    Quiz createQuiz(Quiz quiz);
    StudentQuizAttempt submitQuiz(Long quizId,String email, Map<Long, String> answers);
    QuizAnalyticsDTO getQuizDetails(Long quizId);
    void retakeQuiz(Long quizId, String email);
    StudentQuizDTO getStudentQuiz(Long quizId, String email);
    int calculateTotalMarks(Quiz quiz);
}
