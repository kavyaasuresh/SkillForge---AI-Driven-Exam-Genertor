package com.example.SkillForge_1.dto;
public class StudentDTO {
    private Long studentId;
    private String name;
    private Long userId;

    public StudentDTO(Long studentId, String name, Long userId) {
        this.studentId = studentId;
        this.name = name;
        this.userId = userId;
    }

    // Getters & setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}