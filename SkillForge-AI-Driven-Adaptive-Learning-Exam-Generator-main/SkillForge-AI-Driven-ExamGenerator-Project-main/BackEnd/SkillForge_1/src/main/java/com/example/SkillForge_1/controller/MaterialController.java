//package com.example.SkillForge_1.controller;
//
//import com.example.SkillForge_1.model.Material;
//import com.example.SkillForge_1.model.MaterialType;
//import com.example.SkillForge_1.service.MaterialService;
//import com.example.SkillForge_1.service.MaterialServiceImpl;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/materials")
//@CrossOrigin
//public class MaterialController {
//
//    private final MaterialService materialService;
//
//    public MaterialController(MaterialService materialService) {
//        this.materialService = materialService;
//    }
//
//    // Add material: send JSON { title, materialType, contentUrl }
//
//    // Get all materials
//    @GetMapping
//    public List<Material> getMaterials() {
//        return materialService.getAllMaterials();
//    }
//
//    // Get single material
//    @GetMapping("/{id}")
//    public Material getMaterial(@PathVariable Long id) {
//        return materialService.getMaterialById(id);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteMaterial(@PathVariable Long id) {
//        materialService.deleteMaterial(id);
//    }
//    @GetMapping("/topic/{topicId}")
//    public List<Material> getMaterialsByTopic(@PathVariable Long topicId) {
//        return materialService.getMaterialsByTopic(topicId);
//    }
//
//
//}
package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.model.Material;
import com.example.SkillForge_1.service.MaterialService;
import com.example.SkillForge_1.service.FileStorageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin
public class MaterialController {

    private final MaterialService materialService;
    private final FileStorageService fileStorageService;

    public MaterialController(MaterialService materialService, FileStorageService fileStorageService) {
        this.materialService = materialService;
        this.fileStorageService = fileStorageService;
    }

    // Upload PDF file
    @PostMapping("/upload/pdf/{topicId}")
    public ResponseEntity<Material> uploadPdf(
            @PathVariable Long topicId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            String filePath = fileStorageService.storeFile(file, "materials");
            
            Material material = new Material();
            material.setTitle(title);
            material.setContentUrl(filePath);
            material.setMaterialType(com.example.SkillForge_1.model.MaterialType.PDF);
            
            Material savedMaterial = materialService.addMaterial(material, topicId);
            return ResponseEntity.ok(savedMaterial);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add material with URL
    @PostMapping("/url/{topicId}")
    public ResponseEntity<Material> addUrlMaterial(
            @PathVariable Long topicId,
            @RequestParam("title") String title,
            @RequestParam("url") String url) {
        try {
            Material material = new Material();
            material.setTitle(title);
            material.setContentUrl(url);
            material.setMaterialType(com.example.SkillForge_1.model.MaterialType.URL);
            
            Material savedMaterial = materialService.addMaterial(material, topicId);
            return ResponseEntity.ok(savedMaterial);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add material to a topic
    @PostMapping("/topic/{topicId}")
    public Material addMaterial(
            @PathVariable Long topicId,
            @RequestBody Material material) {

        if (material.getMaterialType() == null) {
            throw new IllegalArgumentException("materialType is required");
        }

        return materialService.addMaterial(material, topicId);
    }

    // Get materials by topic
    @GetMapping("/topic/{topicId}")
    public List<Material> getMaterialsByTopic(@PathVariable Long topicId) {
        return materialService.getMaterialsByTopic(topicId);
    }

    // Delete material
    @DeleteMapping("/{id}")
    public void deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
    }
}
