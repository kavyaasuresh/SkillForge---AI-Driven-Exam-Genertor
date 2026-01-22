package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.ManualEvaluationDTO;
import com.example.SkillForge_1.dto.PendingReviewDTO;
import com.example.SkillForge_1.dto.ReviewAttemptDTO;

import java.util.List;

public interface InstructorReviewService {
    List<PendingReviewDTO> getPendingReviews();
    ReviewAttemptDTO getAttemptForReview(Long attemptId);
    void submitManualEvaluation(Long attemptId, ManualEvaluationDTO dto);
}
