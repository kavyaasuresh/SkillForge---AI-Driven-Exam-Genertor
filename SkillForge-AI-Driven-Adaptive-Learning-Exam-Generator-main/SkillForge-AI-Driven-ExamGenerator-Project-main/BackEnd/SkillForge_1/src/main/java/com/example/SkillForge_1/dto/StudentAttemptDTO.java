package com.example.SkillForge_1.dto;
import java.time.LocalDateTime;

public class StudentAttemptDTO {

    private Long studentId;
    private String studentName;
    private int score;
    private boolean completed;
    private LocalDateTime attemptDate;

    public StudentAttemptDTO() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getAttemptDate() { return attemptDate; }
    public void setAttemptDate(LocalDateTime attemptDate) { this.attemptDate = attemptDate; }
}
