package com.example.SkillForge_1.repository;

import com.example.SkillForge_1.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository
        extends JpaRepository<QuizQuestion, Long> {

    List<QuizQuestion> findByQuiz_QuizId(Long quizId);
    void deleteByQuiz_QuizId(Long quizId);

}
