package com.example.SkillForge_1.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuizCreateDTO {
    private String title;
    private Long topicId;

    private int totalMarks;
    private String difficulty;
    private List<QuizQuestionDTO> questions;
    private List<Long> assignedStudentIds;
    private String questionType;  // MCQ, LONG, SHORT


    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }
    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public List<QuizQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionDTO> questions) { this.questions = questions; }
    public List<Long> getAssignedStudentIds() { return assignedStudentIds; }
    public void setAssignedStudentIds(List<Long> assignedStudentIds) { this.assignedStudentIds = assignedStudentIds; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }

}
