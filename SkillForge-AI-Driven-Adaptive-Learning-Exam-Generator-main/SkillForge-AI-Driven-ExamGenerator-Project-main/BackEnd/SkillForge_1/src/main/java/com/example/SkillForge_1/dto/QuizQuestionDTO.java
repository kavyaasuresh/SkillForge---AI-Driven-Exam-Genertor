
package com.example.SkillForge_1.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class QuizQuestionDTO {

    // ❌ DO NOT accept questionId from frontend during CREATE
    // ✅ Allowed only in responses
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long questionId;

    private String questionText;
    @JsonProperty("type")
    private String questionType;

    // ✅ Frontend sends this as array
    private List<String> options;

    private String correctAnswer;

    // ================= CONSTRUCTORS =================

    // ✅ Required by Jackson
    public QuizQuestionDTO() {}

    // ================= GETTERS & SETTERS =================

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }


    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

}
