package com.example.SkillForge_1.dto;
import java.time.LocalDateTime;
import java.util.List;

public class ReviewAttemptDTO {

    private Long attemptId;
    private String quizTitle;
    private String studentName;
    private List<ReviewQuestionDTO> questions;
    private LocalDateTime submittedAt;
    private int totalAssignedMarks; // new field

    public int getTotalAssignedMarks() { return totalAssignedMarks; }
    public void setTotalAssignedMarks(int totalAssignedMarks) { this.totalAssignedMarks = totalAssignedMarks; }


    // Getters and Setters

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public List<ReviewQuestionDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<ReviewQuestionDTO> questions) {
        this.questions = questions;
    }
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

}
