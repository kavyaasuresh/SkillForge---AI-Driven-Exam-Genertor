//package com.example.SkillForge_1.service;
//
//import com.example.SkillForge_1.model.Material;
//import com.example.SkillForge_1.model.Topic;
//import com.example.SkillForge_1.repository.MaterialRepository;
//import com.example.SkillForge_1.repository.TopicRepository;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class MaterialServiceImpl implements  MaterialService {
//
//    private final MaterialRepository materialRepository;
//    private final TopicRepository topicRepository;
//
//    public MaterialServiceImpl(MaterialRepository materialRepository,
//                               TopicRepository topicRepository) {
//        this.materialRepository = materialRepository;
//        this.topicRepository = topicRepository;
//    }
//
//    @Override
//    public Material addMaterial(Material material, Long topicId) {
//        Topic topic = topicRepository.findById(topicId)
//                .orElseThrow(() -> new RuntimeException("Topic not found"));
//
//        material.setTopic(topic);
//        return materialRepository.save(material);
//    }
//
//    @Override
//    public List<Material> getAllMaterials() {
//        return materialRepository.findAll();
//    }
//
//    @Override
//    public Material getMaterialById(Long id) {
//        return materialRepository.findById(id)
//                .orElseThrow(() -> new IllegalArgumentException("Material not found"));
//    }
//    @Override
//    public void deleteMaterial(Long id) {
//        materialRepository.deleteById(id);
//    }
//    @Override
//    public List<Material> getMaterialsByTopic(Long topicId) {
//        return materialRepository.findByTopic_Id(topicId);
//    }
//
//
//}
package com.example.SkillForge_1.service;

import com.example.SkillForge_1.model.Material;
import com.example.SkillForge_1.model.Topic;
import com.example.SkillForge_1.repository.MaterialRepository;
import com.example.SkillForge_1.repository.TopicRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final TopicRepository topicRepository;

    public MaterialServiceImpl(MaterialRepository materialRepository, TopicRepository topicRepository) {
        this.materialRepository = materialRepository;
        this.topicRepository = topicRepository;
    }

    @Override
    public Material addMaterial(Material material, Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found with id: " + topicId));
        material.setTopic(topic);
        return materialRepository.save(material);
    }

    @Override
    public List<Material> getMaterialsByTopic(Long topicId) {
        return materialRepository.findByTopic_Id(topicId);
    }

    @Override
    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }
}

