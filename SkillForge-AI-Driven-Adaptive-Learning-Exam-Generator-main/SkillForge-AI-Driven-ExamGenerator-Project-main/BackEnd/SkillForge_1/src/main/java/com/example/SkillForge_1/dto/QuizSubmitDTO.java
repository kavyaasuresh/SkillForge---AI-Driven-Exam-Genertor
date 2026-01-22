package com.example.SkillForge_1.dto;

import java.util.Map;

public class QuizSubmitDTO {
    private Map<String, String> answers; // keys are strings because JSON keys are strings

    public Map<String, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, String> answers) {
        this.answers = answers;
    }
}
