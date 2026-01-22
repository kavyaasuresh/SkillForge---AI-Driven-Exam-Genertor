package com.example.SkillForge_1.dto;
public class QuizListDTO {

    private Long quizId;
    private String title;
    private String difficulty;
    private Integer totalMarks;
    private Long topicId;
    private boolean active;

    public QuizListDTO() {}

    public QuizListDTO(Long quizId, String title, String difficulty,
                       Integer totalMarks, Long topicId, boolean active) {
        this.quizId = quizId;
        this.title = title;
        this.difficulty = difficulty;
        this.totalMarks = totalMarks;
        this.topicId = topicId;
        this.active = active;
    }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
