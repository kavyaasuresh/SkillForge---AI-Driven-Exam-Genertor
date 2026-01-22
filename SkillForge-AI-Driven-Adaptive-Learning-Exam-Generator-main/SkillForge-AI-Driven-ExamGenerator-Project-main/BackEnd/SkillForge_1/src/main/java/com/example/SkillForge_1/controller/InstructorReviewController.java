package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.ManualEvaluationDTO;
import com.example.SkillForge_1.dto.PendingReviewDTO;
import com.example.SkillForge_1.dto.ReviewAttemptDTO;
import com.example.SkillForge_1.service.InstructorReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/instructor/analytics")
public class InstructorReviewController {

    @Autowired
    private InstructorReviewService reviewService;

    @GetMapping("/pending-reviews")
    public List<PendingReviewDTO> getPendingReviews() {
        return reviewService.getPendingReviews();
    }

    @GetMapping("/review/{attemptId}")
    public ReviewAttemptDTO getAttempt(@PathVariable Long attemptId) {
        return reviewService.getAttemptForReview(attemptId);
    }

    @PostMapping("/review/{attemptId}")
    public ResponseEntity<?> submitReview(
            @PathVariable Long attemptId,
            @RequestBody ManualEvaluationDTO dto
    ) {
        reviewService.submitManualEvaluation(attemptId, dto);
        return ResponseEntity.ok(Map.of("status", "COMPLETED"));
    }
}
