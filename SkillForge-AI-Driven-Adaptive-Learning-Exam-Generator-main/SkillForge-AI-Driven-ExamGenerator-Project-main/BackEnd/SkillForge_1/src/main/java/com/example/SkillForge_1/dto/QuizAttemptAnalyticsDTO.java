package com.example.SkillForge_1.dto;

import java.time.LocalDateTime;

public class QuizAttemptAnalyticsDTO {

    private Long attemptId;
    private Long studentId;
    private String studentName;
    private Integer score;
    private String evaluationStatus;
    private LocalDateTime submittedAt;

    public QuizAttemptAnalyticsDTO(
            Long attemptId,
            Long studentId,
            String studentName,
            Integer score,
            String evaluationStatus,
            LocalDateTime submittedAt
    ) {
        this.attemptId = attemptId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.score = score;
        this.evaluationStatus = evaluationStatus;
        this.submittedAt = submittedAt;
    }

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public String getEvaluationStatus() { return evaluationStatus; }
    public void setEvaluationStatus(String evaluationStatus) { this.evaluationStatus = evaluationStatus; }
    
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}