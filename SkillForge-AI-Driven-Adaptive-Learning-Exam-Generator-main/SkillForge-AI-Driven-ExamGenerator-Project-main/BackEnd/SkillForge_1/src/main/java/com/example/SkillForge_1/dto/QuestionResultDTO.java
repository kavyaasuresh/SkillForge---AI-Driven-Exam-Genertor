package com.example.SkillForge_1.dto;

public class QuestionResultDTO {

    private String question;
    private Long questionId;

    private String studentAnswer;
    private Integer marksAwarded;
    private String evaluationStatus;
    private String correctAnswer;
    private int maxMarks;
    private String type; // MCQ or LONG

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    // Getter for correctAnswer
    public String getCorrectAnswer() {
        return correctAnswer;
    }

    // Setter for correctAnswer
    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    // Getter for maxMarks
    public int getMaxMarks() {
        return maxMarks;
    }

    // Setter for maxMarks
    public void setMaxMarks(int maxMarks) {
        this.maxMarks = maxMarks;
    }

    /* ===== Getters & Setters ===== */

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public void setStudentAnswer(String studentAnswer) {
        this.studentAnswer = studentAnswer;
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

    public void setQuestionId(Long questionId)
    {
        this.questionId=questionId;
    }
    public Long getQuestionId(){
        return  questionId;
    }
}
