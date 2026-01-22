//package com.example.SkillForge_1.model;
//
//import jakarta.persistence.*;
//
//@Entity
//@Table(name = "student_quiz_attempt")
//public class StudentQuizAttempt {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long attemptId;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "student_id")
//    private UserAuthentication student;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "quiz_id")
//    private Quiz quiz;
//
//    private Integer score;
//
//    public Long getAttemptId() { return attemptId; }
//
//    public UserAuthentication getStudent() { return student; }
//    public void setStudent(UserAuthentication student) { this.student = student; }
//
//    public Quiz getQuiz() { return quiz; }
//    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
//
//    public Integer getScore() { return score; }
//    public void setScore(Integer score) { this.score = score; }
//}
package com.example.SkillForge_1.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "student_quiz_attempt")
public class StudentQuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attemptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private UserAuthentication student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", referencedColumnName = "quizId")
    private Quiz quiz;

    // ✅ Final total score (auto + manual + AI)
    private Integer score;

    // ✅ Auto-calculated MCQ score
    @Column(name = "auto_score")
    private Integer autoScore;

    @OneToMany(mappedBy = "attempt", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<StudentQuestionResponse> responses;

    // ✅ Instructor given score for long answers
    @Column(name = "manual_score")
    private Integer manualScore;

    // ✅ AI / keyword-based score (optional)
    @Column(name = "ai_score")
    private Integer aiScore;

    // ✅ Quiz attempt timing
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;

    // ✅ Quiz status
    @Enumerated(EnumType.STRING)
    private AttemptStatus status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private StudentQuizAssignment assignment;

    public StudentQuizAssignment getAssignment() { return assignment; }
    public void setAssignment(StudentQuizAssignment assignment) { this.assignment = assignment; }


    /* ================= GETTERS & SETTERS ================= */

    public Long getAttemptId() { return attemptId; }

    public UserAuthentication getStudent() { return student; }
    public void setStudent(UserAuthentication student) { this.student = student; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getAutoScore() { return autoScore; }
    public void setAutoScore(Integer autoScore) { this.autoScore = autoScore; }

    public Integer getManualScore() { return manualScore; }
    public void setManualScore(Integer manualScore) { this.manualScore = manualScore; }

    public Integer getAiScore() { return aiScore; }
    public void setAiScore(Integer aiScore) { this.aiScore = aiScore; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }
    public List<StudentQuestionResponse> getResponses() {
        return responses;
    }

    public void setResponses(List<StudentQuestionResponse> responses) {
        this.responses = responses;
    }
    public String getEvaluationStatus() {
        return status != null ? status.name() : null;
    }

}
