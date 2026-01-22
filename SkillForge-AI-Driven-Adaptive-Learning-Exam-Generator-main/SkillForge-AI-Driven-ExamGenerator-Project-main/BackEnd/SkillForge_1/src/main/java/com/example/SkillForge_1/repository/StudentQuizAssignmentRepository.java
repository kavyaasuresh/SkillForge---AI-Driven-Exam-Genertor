//package com.example.SkillForge_1.repository;
//
//import com.example.SkillForge_1.model.StudentQuizAssignment;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.List;
//import java.util.Optional;
//public interface StudentQuizAssignmentRepository
//        extends JpaRepository<StudentQuizAssignment, Long> {
//
//    List<StudentQuizAssignment> findByStudent_Id(Long studentId);
//
//    Optional<StudentQuizAssignment>
//    findByStudent_IdAndQuiz_QuizId(Long studentId, Long quizId);
//    int countByQuiz_QuizId(Long quizId);
//}
package com.example.SkillForge_1.repository;

import com.example.SkillForge_1.model.StudentQuizAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface
StudentQuizAssignmentRepository
        extends JpaRepository<StudentQuizAssignment, Long> {

    List<StudentQuizAssignment> findByStudent_Id(Long studentId);

    Optional<StudentQuizAssignment>
    findByStudent_IdAndQuiz_QuizId(Long studentId, Long quizId);

    List<StudentQuizAssignment> findByQuiz_QuizId(Long quizId);

    int countByQuiz_QuizId(Long quizId);
    void deleteByQuiz_QuizId(Long quizId);

}
