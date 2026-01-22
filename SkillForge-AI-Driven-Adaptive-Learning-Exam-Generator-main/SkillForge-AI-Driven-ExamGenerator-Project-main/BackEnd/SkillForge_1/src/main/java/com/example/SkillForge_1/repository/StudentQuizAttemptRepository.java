//package com.example.SkillForge_1.repository;
//
//import com.example.SkillForge_1.model.StudentQuizAttempt;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//public interface StudentQuizAttemptRepository
//        extends JpaRepository<StudentQuizAttempt, Long> {
//
//    boolean existsByStudent_IdAndQuiz_QuizId(Long studentId, Long quizId);
//
//    int countByQuiz_QuizId(Long quizId);
//}
//
package com.example.SkillForge_1.repository;
import com.example.SkillForge_1.model.*;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentQuizAttemptRepository
        extends JpaRepository<StudentQuizAttempt, Long> {
    List<StudentQuizAttempt> findByStatus(AttemptStatus status);
    List<StudentQuizAttempt> findByQuiz_QuizId(Long quizId);
    boolean existsByStudent_IdAndQuiz_QuizId(Long userId, Long quizId);
    int countByQuiz_QuizId(Long quizId);
    Optional<StudentQuizAttempt> findByStudent_IdAndQuiz_QuizId(Long studentId, Long quizId);
    Optional<StudentQuizAttempt> findByQuizAndStudent(Quiz quiz, UserAuthentication student);
    Optional<StudentQuizAttempt> findByQuiz_QuizIdAndStudent_Email(Long quizId, String email);
    Optional<StudentQuizAttempt> findTopByStudent_IdAndQuiz_QuizIdOrderBySubmittedAtDesc(
            Long studentId,
            Long quizId
    );
    Optional<StudentQuizAttempt> findByAssignment(StudentQuizAssignment assignment);
}

