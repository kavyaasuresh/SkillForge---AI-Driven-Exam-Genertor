package com.example.SkillForge_1.dto;

import java.util.List;

public class ManualEvaluationDTO {

    private Integer marks;
    private List<ManualScoreDTO> responses;
    public List<ManualScoreDTO> getResponses() {
        return responses;
    }

    public void setResponses(List<ManualScoreDTO> responses) {
        this.responses = responses;
    }
    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }
}
