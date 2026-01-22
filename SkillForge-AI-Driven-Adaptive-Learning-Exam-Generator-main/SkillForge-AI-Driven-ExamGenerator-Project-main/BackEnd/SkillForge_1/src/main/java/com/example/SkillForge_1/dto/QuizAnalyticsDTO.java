//
//package com.example.SkillForge_1.dto;
//
//import java.util.List;
//
//public class QuizAnalyticsDTO {
//
//    private Long quizId;
//    private String title;
//    private String difficulty;
//    private Integer totalMarks;
//
//    private int totalAssigned;
//    private int totalAttempted;
//
//    private List<AssignedStudentDTO> assignedStudents;
//    private List<QuizAttemptAnalyticsDTO> attempts;
//
//    public Long getQuizId() { return quizId; }
//    public void setQuizId(Long quizId) { this.quizId = quizId; }
//
//    public String getTitle() { return title; }
//    public void setTitle(String title) { this.title = title; }
//
//    public String getDifficulty() { return difficulty; }
//    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
//
//    public Integer getTotalMarks() { return totalMarks; }
//    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
//
//    public int getTotalAssigned() { return totalAssigned; }
//    public void setTotalAssigned(int totalAssigned) { this.totalAssigned = totalAssigned; }
//
//    public int getTotalAttempted() { return totalAttempted; }
//    public void setTotalAttempted(int totalAttempted) { this.totalAttempted = totalAttempted; }
//
//    public List<AssignedStudentDTO> getAssignedStudents() { return assignedStudents; }
//    public void setAssignedStudents(List<AssignedStudentDTO> assignedStudents) {
//        this.assignedStudents = assignedStudents;
//    }
//
//    public List<QuizAttemptAnalyticsDTO> getAttempts() { return attempts; }
//    public void setAttempts(List<QuizAttemptAnalyticsDTO> attempts) {
//        this.attempts = attempts;
//    }
//}
package com.example.SkillForge_1.dto;

import java.util.List;

public class QuizAnalyticsDTO {

    private Long quizId;
    private String title;
    private String difficulty;
    private Integer totalMarks;
    private Long topicId;

    private int totalAssigned;
    private int totalAttempted;

    private List<QuizQuestionDTO> questions;
    private List<AssignedStudentDTO> assignedStudents;
    private List<QuizAttemptAnalyticsDTO> attempts;

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

    public int getTotalAssigned() { return totalAssigned; }
    public void setTotalAssigned(int totalAssigned) { this.totalAssigned = totalAssigned; }

    public int getTotalAttempted() { return totalAttempted; }
    public void setTotalAttempted(int totalAttempted) { this.totalAttempted = totalAttempted; }

    public List<QuizQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionDTO> questions) {
        this.questions = questions;
    }

    public List<AssignedStudentDTO> getAssignedStudents() { return assignedStudents; }
    public void setAssignedStudents(List<AssignedStudentDTO> assignedStudents) {
        this.assignedStudents = assignedStudents;
    }

    public List<QuizAttemptAnalyticsDTO> getAttempts() { return attempts; }
    public void setAttempts(List<QuizAttemptAnalyticsDTO> attempts) {
        this.attempts = attempts;
    }
}
