package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.ManualEvaluationDTO;
import com.example.SkillForge_1.model.*;
import com.example.SkillForge_1.repository.StudentQuestionResponseRepository;
import com.example.SkillForge_1.repository.StudentQuizAssignmentRepository;
import com.example.SkillForge_1.repository.StudentQuizAttemptRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructor/evaluation")
@CrossOrigin
public class InstructorEvaluationController {

    @Autowired
    private StudentQuestionResponseRepository responseRepository;

    @Autowired
    private StudentQuizAttemptRepository attemptRepository;

    @Autowired
    private StudentQuizAssignmentRepository assignmentRepository;


    /**
     * 🔹 Fetch all pending long-answer responses for a quiz
     */
    @GetMapping("/pending/{quizId}")
    public ResponseEntity<List<StudentQuestionResponse>> getPendingResponses(
            @PathVariable Long quizId) {

        List<StudentQuestionResponse> responses =
                responseRepository.findByQuiz_QuizIdAndEvaluationStatus(
                        quizId, "PENDING_MANUAL");

        return ResponseEntity.ok(responses);
    }

    /**
     * 🔹 Manually evaluate a long-answer response
     */
    @PutMapping("/{responseId}")
    @Transactional
    public ResponseEntity<String> evaluateResponse(
            @PathVariable Long responseId,
            @RequestBody ManualEvaluationDTO dto) {

        StudentQuestionResponse response = responseRepository.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Response not found"));

        // Update response
        response.setMarksAwarded(dto.getMarks());
        response.setMarksObtained(dto.getMarks());
        response.setEvaluationStatus("EVALUATED");
        response.setStatus(QuestionEvaluationStatus.MANUALLY_EVALUATED);
        responseRepository.save(response);

        StudentQuizAttempt attempt = response.getAttempt();

        // 🔹 Recalculate manual score from all evaluated questions
        int manualScore = responseRepository
                .findByAttempt_AttemptId(attempt.getAttemptId())
                .stream()
                .filter(r -> r.getStatus() == QuestionEvaluationStatus.MANUALLY_EVALUATED)
                .mapToInt(StudentQuestionResponse::getMarksObtained)
                .sum();

        attempt.setManualScore(manualScore);
        attempt.setScore(attempt.getAutoScore() + manualScore);

        // 🔹 Check if any PENDING_MANUAL still exists
        boolean stillPending = responseRepository
                .findByAttempt_AttemptId(attempt.getAttemptId())
                .stream()
                .anyMatch(r -> r.getStatus() == QuestionEvaluationStatus.PENDING_MANUAL);

        if (!stillPending) {
            attempt.setStatus(AttemptStatus.COMPLETED);

            // 🔥 ALSO unlock assignment
            StudentQuizAssignment assignment =
                    assignmentRepository.findByStudent_IdAndQuiz_QuizId(
                            attempt.getStudent().getId(),
                            attempt.getQuiz().getQuizId()
                    ).orElseThrow();

            assignment.setScore(attempt.getScore());
            assignment.setStatus("COMPLETED");
            assignmentRepository.save(assignment);
        }

        attemptRepository.save(attempt);

        return ResponseEntity.ok("Evaluation completed successfully");
    }
}