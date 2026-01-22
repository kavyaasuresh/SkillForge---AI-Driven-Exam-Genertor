package com.example.SkillForge_1.dto;

import com.example.SkillForge_1.model.Quiz;

public class InstructorQuizDTO {

    private Long quizId;
    private String title;
    private String topic;
    private String difficulty;

    // Constructor
    public InstructorQuizDTO(Quiz quiz) {
        this.quizId = quiz.getQuizId();
        this.title = quiz.getTitle();
        this.topic = quiz.getTopic();
        this.difficulty = quiz.getDifficulty();
    }

    // ---------- Getters ----------
    public Long getQuizId() {
        return quizId;
    }

    public String getTitle() {
        return title;
    }

    public String getTopic() {
        return topic;
    }

    public String getDifficulty() {
        return difficulty;
    }

    // ---------- Setters ----------
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }
}
