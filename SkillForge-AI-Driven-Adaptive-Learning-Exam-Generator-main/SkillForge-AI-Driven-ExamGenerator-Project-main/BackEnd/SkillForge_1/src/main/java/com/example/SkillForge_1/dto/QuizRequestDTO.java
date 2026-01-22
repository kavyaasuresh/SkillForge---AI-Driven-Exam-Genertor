package com.example.SkillForge_1.dto;

public class QuizRequestDTO {

    private String quizTitle;
    private Long topicId;
    private Long instructorId;

    // Constructors
    public QuizRequestDTO() {}

    public QuizRequestDTO(String quizTitle, Long topicId, Long instructorId) {
        this.quizTitle = quizTitle;
        this.topicId = topicId;
        this.instructorId = instructorId;
    }

    // Getters and Setters
    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Long getTopicId() {
        return topicId;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
    }

    public Long getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(Long instructorId) {
        this.instructorId = instructorId;
    }
}
