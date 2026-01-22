//package com.example.SkillForge_1.dto;
//import java.time.LocalDateTime;
//import java.util.List;
//
//public class QuizResultDTO {
//
//    private Long attemptId;
//    private Long quizId;
//
//    private String quizTitle;
//    private String topicTitle;
//    private LocalDateTime createdAt;
//    private String correctAnswer;
//    private int maxMarks;
//
//    private int totalScore;
//    private int totalMarks;
//    private String evaluationStatus;
//
//    private List<QuestionResultDTO> questions;
//
//    // ---------------- GETTERS ----------------
//
//    public Long getAttemptId() {
//        return attemptId;
//    }
//
//    public Long getQuizId() {
//        return quizId;
//    }
//
//    public String getQuizTitle() {
//        return quizTitle;
//    }
//
//    public String getTopicTitle() {
//        return topicTitle;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public int getTotalScore() {
//        return totalScore;
//    }
//
//    public int getTotalMarks() {
//        return totalMarks;
//    }
//
//    public String getEvaluationStatus() {
//        return evaluationStatus;
//    }
//
//    public List<QuestionResultDTO> getQuestions() {
//        return questions;
//    }
//
//    // ---------------- SETTERS ----------------
//
//    public void setAttemptId(Long attemptId) {
//        this.attemptId = attemptId;
//    }
//
//    public void setQuizId(Long quizId) {
//        this.quizId = quizId;
//    }
//
//    public void setQuizTitle(String quizTitle) {
//        this.quizTitle = quizTitle;
//    }
//
//    public void setTopicTitle(String topicTitle) {
//        this.topicTitle = topicTitle;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//
//    public void setTotalScore(int totalScore) {
//        this.totalScore = totalScore;
//    }
//
//    public void setTotalMarks(int totalMarks) {
//        this.totalMarks = totalMarks;
//    }
//
//    public void setEvaluationStatus(String evaluationStatus) {
//        this.evaluationStatus = evaluationStatus;
//    }
//
//    public void setQuestions(List<QuestionResultDTO> questions) {
//        this.questions = questions;
//    }
//    // Getter for correctAnswer
//    public String getCorrectAnswer() {
//        return correctAnswer;
//    }
//
//    // Setter for correctAnswer
//    public void setCorrectAnswer(String correctAnswer) {
//        this.correctAnswer = correctAnswer;
//    }
//
//    // Getter for maxMarks
//    public int getMaxMarks() {
//        return maxMarks;
//    }
//
//    // Setter for maxMarks
//    public void setMaxMarks(int maxMarks) {
//        this.maxMarks = maxMarks;
//    }
//}
package com.example.SkillForge_1.dto;

public class QuizResultDTO {

    private Long attemptId;
    private String quizTitle;
    private String topicTitle;
    private int totalScore;
    private int totalMarks;
    private int correctCount;
    private int totalQuestions;
    private int attendedCount;
    private int percentage;
    private String passStatus; // "Pass"/"Fail"
    private String suggestion; // AI suggestion or next quiz

    // ------------------ Default Constructor ------------------
    public QuizResultDTO() {
    }

    // ------------------ Parameterized Constructor ------------------
    public QuizResultDTO(Long attemptId, String quizTitle, String topicTitle, int totalScore, int totalMarks,
                         int correctCount, int totalQuestions, int attendedCount, int percentage,
                         String passStatus, String suggestion) {
        this.attemptId = attemptId;
        this.quizTitle = quizTitle;
        this.topicTitle = topicTitle;
        this.totalScore = totalScore;
        this.totalMarks = totalMarks;
        this.correctCount = correctCount;
        this.totalQuestions = totalQuestions;
        this.attendedCount = attendedCount;
        this.percentage = percentage;
        this.passStatus = passStatus;
        this.suggestion = suggestion;
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

    public int getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(int correctCount) {
        this.correctCount = correctCount;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getAttendedCount() {
        return attendedCount;
    }

    public void setAttendedCount(int attendedCount) {
        this.attendedCount = attendedCount;
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

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }

    // ------------------ toString() ------------------
    @Override
    public String toString() {
        return "QuizResultDTO{" +
                "attemptId=" + attemptId +
                ", quizTitle='" + quizTitle + '\'' +
                ", topicTitle='" + topicTitle + '\'' +
                ", totalScore=" + totalScore +
                ", totalMarks=" + totalMarks +
                ", correctCount=" + correctCount +
                ", totalQuestions=" + totalQuestions +
                ", attendedCount=" + attendedCount +
                ", percentage=" + percentage +
                ", passStatus='" + passStatus + '\'' +
                ", suggestion='" + suggestion + '\'' +
                '}';
    }
}
