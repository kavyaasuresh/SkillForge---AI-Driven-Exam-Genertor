package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.*;
import com.example.SkillForge_1.model.*;
import com.example.SkillForge_1.repository.StudentQuestionResponseRepository;
import com.example.SkillForge_1.repository.StudentQuizAssignmentRepository;
import com.example.SkillForge_1.repository.StudentQuizAttemptRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstructorReviewServiceImpl implements InstructorReviewService {

    @Autowired
    private StudentQuizAttemptRepository attemptRepo;

    @Autowired
    private StudentQuestionResponseRepository responseRepo;

    @Autowired
    private StudentQuizAssignmentRepository assignmentRepository;
    @Override
    public List<PendingReviewDTO> getPendingReviews() {
        List<StudentQuizAttempt> attempts = attemptRepo.findByStatus(AttemptStatus.PENDING_MANUAL_EVALUATION);

        return attempts.stream().map(a -> {
            PendingReviewDTO dto = new PendingReviewDTO();
            dto.setAttemptId(a.getAttemptId());
            dto.setQuizId(a.getQuiz().getQuizId());
            dto.setQuizTitle(a.getQuiz().getTitle());
            dto.setStudentName(a.getStudent().getName());
            dto.setAutoScore(a.getAutoScore());
            dto.setTotalMarks(a.getQuiz().getTotalMarks());
            dto.setSubmittedAt(a.getSubmittedAt());
            return dto;
        }).toList();
    }

    @Override
    public ReviewAttemptDTO getAttemptForReview(Long attemptId) {
        StudentQuizAttempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        ReviewAttemptDTO dto = new ReviewAttemptDTO();
        dto.setAttemptId(attemptId);
        dto.setQuizTitle(attempt.getQuiz().getTitle());
        dto.setStudentName(attempt.getStudent().getName());
        dto.setSubmittedAt(attempt.getSubmittedAt());

        List<ReviewQuestionDTO> questions = responseRepo.findByAttempt_AttemptId(attemptId).stream().map(r -> {
            ReviewQuestionDTO q = new ReviewQuestionDTO();
            q.setResponseId(r.getId());
            q.setQuestionText(r.getQuestion().getQuestion());
            q.setStudentAnswer(r.getStudentAnswer());
            q.setType(r.getQuestion().getType());
            q.setMaxMarks(r.getQuestion().getMarks() != null ? r.getQuestion().getMarks() : 0);
            q.setMarksObtained(r.getMarksObtained() != null ? r.getMarksObtained() : 0);
            return q;
        }).toList();

        int totalAssigned = questions.stream()
                .mapToInt(ReviewQuestionDTO::getMaxMarks)
                .sum();
        
        dto.setQuestions(questions);
        dto.setTotalAssignedMarks(totalAssigned);
        return dto;
    }

    @Transactional
    @Override
    public void submitManualEvaluation(Long attemptId, ManualEvaluationDTO dto) {
        StudentQuizAttempt attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        int manualScore = 0;

        for (ManualScoreDTO score : dto.getResponses()) {
            StudentQuestionResponse resp = responseRepo.findById(score.getResponseId())
                    .orElseThrow(() -> new RuntimeException("Response not found"));

            resp.setMarksObtained(score.getMarks());
            resp.setStatus(QuestionEvaluationStatus.MANUALLY_EVALUATED);
            manualScore += score.getMarks();
        }

        // Update attempt scores
        attempt.setManualScore(manualScore);
        attempt.setScore(attempt.getAutoScore() + manualScore);

        // Mark attempt as completed
        attempt.setStatus(AttemptStatus.COMPLETED);
        attemptRepo.save(attempt);

        // ✅ Mark the assignment as completed
        StudentQuizAssignment assignment = attempt.getAssignment();
        if (assignment != null) {
            assignment.setStatus("COMPLETED");
            assignmentRepository.save(assignment); // Make sure this repo is autowired
        }
    }
}