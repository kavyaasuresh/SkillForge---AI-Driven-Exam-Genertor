package com.example.SkillForge_1.model;

import jakarta.persistence.*;

@Entity
@Table(name = "student_question_response")
public class StudentQuestionResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private StudentQuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private QuizQuestion question;

    @Column(columnDefinition = "TEXT")
    private String studentAnswer;   // MCQ index OR long text

    private Integer marksObtained;  // per question
    // 🔹 Marks given for this question
    private Integer marksAwarded;

    // 🔹 PENDING_MANUAL | EVALUATED | AUTO_EVALUATED
    private String evaluationStatus;
    @Enumerated(EnumType.STRING)
    private QuestionEvaluationStatus status;

    private Integer aiScore;        // optional

    @ManyToOne
    @JoinColumn(name="quiz_id")
    private Quiz quiz;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }


    public StudentQuizAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(StudentQuizAttempt attempt) {
        this.attempt = attempt;
    }

    public QuizQuestion getQuestion() {
        return question;
    }

    public void setQuestion(QuizQuestion question) {
        this.question = question;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public void setStudentAnswer(String studentAnswer) {
        this.studentAnswer = studentAnswer;
    }

    public Integer getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }

    public QuestionEvaluationStatus getStatus() {
        return status;
    }

    public void setStatus(QuestionEvaluationStatus status) {
        this.status = status;
    }

    public Integer getAiScore() {
        return aiScore;
    }

    public void setAiScore(Integer aiScore) {
        this.aiScore = aiScore;
    }
    public Integer getMarksAwarded() {
        return marksAwarded;
    }

    public void setMarksAwarded(Integer marksAwarded) {
        this.marksAwarded = marksAwarded;
    }

    public String getEvaluationStatus() {
        return evaluationStatus;
    }

    public void setEvaluationStatus(String evaluationStatus) {
        this.evaluationStatus = evaluationStatus;
    }

    // Convenience accessor matching other parts of the codebase
    public Long getResponseId() {
        return this.id;
    }

    public void setResponseId(Long responseId) {
        this.id = responseId;
    }
}
