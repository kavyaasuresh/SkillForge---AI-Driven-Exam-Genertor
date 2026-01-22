//package com.example.SkillForge_1.repository;
//
//import com.example.SkillForge_1.model.Material;
//import com.example.SkillForge_1.model.MaterialStatus;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.List;
//import java.util.Optional;
//
//public interface MaterialRepository extends JpaRepository<Material, Long> {
//    List<Material> findByTopic_Id(Long id);
//}
package com.example.SkillForge_1.repository;

import com.example.SkillForge_1.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByTopic_Id(Long topicId);
}

