package com.example.SkillForge_1.service;

import com.example.SkillForge_1.model.Material;

import java.util.List;

public interface MaterialService {
    Material addMaterial(Material material, Long topicId);
    List<Material> getMaterialsByTopic(Long topicId);
    void deleteMaterial(Long id);
}
