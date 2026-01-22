//package com.example.SkillForge_1.dto;
//import java.util.List;
//
//public class QuizResultSummaryDTO {
//
//    private Long attemptId;
//    private String quizTitle;
//    private Integer totalScore;
//    private List<QuestionResultDTO> questions;
//
//    /* ===== Getters & Setters ===== */
//
//    public Long getAttemptId() {
//        return attemptId;
//    }
//
//    public void setAttemptId(Long attemptId) {
//        this.attemptId = attemptId;
//    }
//
//    public String getQuizTitle() {
//        return quizTitle;
//    }
//
//    public void setQuizTitle(String quizTitle) {
//        this.quizTitle = quizTitle;
//    }
//
//    public Integer getTotalScore() {
//        return totalScore;
//    }
//
//    public void setTotalScore(Integer totalScore) {
//        this.totalScore = totalScore;
//    }
//
//    public List<QuestionResultDTO> getQuestions() {
//        return questions;
//    }
//
//    public void setQuestions(List<QuestionResultDTO> questions) {
//        this.questions = questions;
//    }
//}
package com.example.SkillForge_1.dto;

import java.util.List;

public class QuizResultSummaryDTO {

    private Long attemptId;
    private String quizTitle;
    private String topicTitle;
    private int totalScore;
    private int totalMarks;
    private int percentage;
    private String passStatus;
    private String studentName;
    private String studentId;
    private String attemptDate;
    private List<QuestionResultDTO> questions;

    // ------------------ Default Constructor ------------------
    public QuizResultSummaryDTO() {
    }

    // ------------------ Parameterized Constructor ------------------
    public QuizResultSummaryDTO(Long attemptId, String quizTitle, String topicTitle, int totalScore, int totalMarks,
                                int percentage, String passStatus, String studentName, String studentId,
                                String attemptDate, List<QuestionResultDTO> questions) {
        this.attemptId = attemptId;
        this.quizTitle = quizTitle;
        this.topicTitle = topicTitle;
        this.totalScore = totalScore;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.passStatus = passStatus;
        this.studentName = studentName;
        this.studentId = studentId;
        this.attemptDate = attemptDate;
        this.questions = questions;
    }

    // ------------------ Getters and Setters ------------------
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

    public String getTopicTitle() {
        return topicTitle;
    }

    public void setTopicTitle(String topicTitle) {
        this.topicTitle = topicTitle;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public int getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(int totalMarks) {
        this.totalMarks = totalMarks;
    }

    public int getPercentage() {
        return percentage;
    }

    public void setPercentage(int percentage) {
        this.percentage = percentage;
    }

    public String getPassStatus() {
        return passStatus;
    }

    public void setPassStatus(String passStatus) {
        this.passStatus = passStatus;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getAttemptDate() {
        return attemptDate;
    }

    public void setAttemptDate(String attemptDate) {
        this.attemptDate = attemptDate;
    }

    public List<QuestionResultDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResultDTO> questions) {
        this.questions = questions;
    }

    // ------------------ toString() ------------------
    @Override
    public String toString() {
        return "QuizResultSummaryDTO{" +
                "attemptId=" + attemptId +
                ", quizTitle='" + quizTitle + '\'' +
                ", topicTitle='" + topicTitle + '\'' +
                ", totalScore=" + totalScore +
                ", totalMarks=" + totalMarks +
                ", percentage=" + percentage +
                ", passStatus='" + passStatus + '\'' +
                ", studentName='" + studentName + '\'' +
                ", studentId='" + studentId + '\'' +
                ", attemptDate='" + attemptDate + '\'' +
                ", questions=" + questions +
                '}';
    }
}
