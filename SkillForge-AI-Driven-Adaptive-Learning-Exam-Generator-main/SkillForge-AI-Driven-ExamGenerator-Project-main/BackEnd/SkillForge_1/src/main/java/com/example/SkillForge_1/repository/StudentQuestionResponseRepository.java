package com.example.SkillForge_1.repository;

import com.example.SkillForge_1.model.QuestionEvaluationStatus;
import com.example.SkillForge_1.model.StudentQuestionResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentQuestionResponseRepository
        extends JpaRepository<StudentQuestionResponse, Long> {

    List<StudentQuestionResponse> findByQuiz_QuizIdAndEvaluationStatus(
            Long quizId, String evaluationStatus);

    List<StudentQuestionResponse> findByAttempt_AttemptId(Long attemptId);

    List<StudentQuestionResponse> findByStatus(QuestionEvaluationStatus status);
}
