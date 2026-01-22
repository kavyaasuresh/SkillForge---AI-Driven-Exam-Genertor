package com.example.SkillForge_1.dto;

import com.example.SkillForge_1.model.MaterialType;

public class MaterialRequestDTO {

    private String title;
    private MaterialType materialType;
    private String contentUrl;
    private long topicId;

    public MaterialRequestDTO() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public MaterialType getMaterialType() { return materialType; }
    public void setMaterialType(MaterialType materialType) { this.materialType = materialType; }

    public String getContentUrl() { return contentUrl; }
    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }

    public long getTopicId() { return topicId; }
    public void setTopicId(long topicId) { this.topicId=topicId; }

}
