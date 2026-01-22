package com.example.SkillForge_1.dto;

import java.time.LocalDateTime;

public class StudentQuizScoreDTO {

    private Long studentId;
    private String studentName;
    private Long quizId;
    private String quizTitle;
    private String topicName;
    private String difficulty;
    private Double score;
    private Integer totalMarks;
    private Double percentage;
    private String status;
    private LocalDateTime submittedAt;

    public StudentQuizScoreDTO(Long studentId, String studentName,
                               Long quizId, String quizTitle,
                               String topicName, String difficulty,
                               Double score, Integer totalMarks,
                               Double percentage, String status,
                               LocalDateTime submittedAt) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.topicName = topicName;
        this.difficulty = difficulty;
        this.score = score;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
