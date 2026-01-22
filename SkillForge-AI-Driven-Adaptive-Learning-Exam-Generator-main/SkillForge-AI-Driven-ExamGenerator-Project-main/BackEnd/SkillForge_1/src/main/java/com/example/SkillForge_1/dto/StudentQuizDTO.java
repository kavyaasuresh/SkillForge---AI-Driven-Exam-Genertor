
package com.example.SkillForge_1.dto;
import java.time.LocalDateTime;
//package com.example.SkillForge_1.dto;
//
//public class StudentQuizDTO {
//
//    private Long quizId;
//    private String title;
//    private String topic;
//    private String difficulty;
//    private String status;
//    private Integer score;
//    private Integer totalMarks;
//
//    public StudentQuizDTO() {}
//
//    public StudentQuizDTO(
//            Long quizId,
//            String title,
//            String topic,
//            String difficulty,
//            Integer totalMarks,
//            String status,
//            Integer score
//    ) {
//        this.quizId = quizId;
//        this.title = title;
//        this.topic = topic;
//        this.difficulty = difficulty;
//        this.totalMarks = totalMarks;
//        this.status = status;
//        this.score = score;
//    }
//
//    public Long getQuizId() {
//        return quizId;
//    }
//
//    public void setQuizId(Long quizId) {
//        this.quizId = quizId;
//    }
//
//    public String getTitle() {
//        return title;
//    }
//
//    public void setTitle(String title) {
//        this.title = title;
//    }
//
//    public String getTopic() {
//        return topic;
//    }
//
//    public void setTopic(String topic) {
//        this.topic = topic;
//    }
//
//    public String getDifficulty() {
//        return difficulty;
//    }
//
//    public void setDifficulty(String difficulty) {
//        this.difficulty = difficulty;
//    }
//
//    public String getStatus() {
//        return status;
//    }
//
//    public void setStatus(String status) {
//        this.status = status;
//    }
//
//    public Integer getScore() {
//        return score;
//    }
//
//    public void setScore(Integer score) {
//        this.score = score;
//    }
//
//    public Integer getTotalMarks() {
//        return totalMarks;
//    }
//
//    public void setTotalMarks(Integer totalMarks) {
//        this.totalMarks = totalMarks;
//    }
//}
public class StudentQuizDTO {

    private Long quizId;
    private Long attemptId;        // 🔥 REQUIRED
    private String title;
    private String topic;
    private String difficulty;
    private Integer totalMarks;
    private String status;
    private Integer score;
    private Integer percentage;          // 🔥 NEW
    private LocalDateTime submittedAt;   // 🔥 REQUIRED

    // ===== GETTERS & SETTERS =====

    public Integer getPercentage() {
        return percentage;
    }
    public void setPercentage(Integer percentage) {
        this.percentage = percentage;
    }

    public Long getQuizId() {
        return quizId;
    }
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Long getAttemptId() {
        return attemptId;
    }
    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getTopic() {
        return topic;
    }
    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDifficulty() {
        return difficulty;
    }
    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }
    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getScore() {
        return score;
    }
    public void setScore(Integer score) {
        this.score = score;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
