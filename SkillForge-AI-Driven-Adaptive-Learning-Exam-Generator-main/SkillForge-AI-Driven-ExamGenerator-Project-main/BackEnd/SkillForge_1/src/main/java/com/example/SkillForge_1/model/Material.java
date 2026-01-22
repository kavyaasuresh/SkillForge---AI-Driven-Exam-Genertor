//package com.example.SkillForge_1.model;
//
//import jakarta.persistence.*;
//
//@Entity
//@Table(name = "materials")
//public class Material {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "material_id")
//    private Long materialId;
//
//    @Column(nullable = false)
//    private String title; // Name of material
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private MaterialType materialType; // PDF, VIDEO, IMAGE
//
//    @Column(nullable = false, length = 2000)
//    private String contentUrl; // URL of file/link
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "topic_id", nullable = false)
//    private Topic topic;
//
//    // Constructors
//    public Material() {}
//    public Material(String title, MaterialType materialType, String contentUrl) {
//        this.title = title;
//        this.materialType = materialType;
//        this.contentUrl = contentUrl;
//    }
//
//    // Getters & Setters
//    public Long getMaterialId() { return materialId; }
//    public void setMaterialId(Long materialId) { this.materialId = materialId; }
//
//    public String getTitle() { return title; }
//    public void setTitle(String title) { this.title = title; }
//
//    public MaterialType getMaterialType() { return materialType; }
//    public void setMaterialType(MaterialType materialType) { this.materialType = materialType; }
//
//    public String getContentUrl() { return contentUrl; }
//    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }
//
//    public Topic getTopic() { return topic; }
//    public void setTopic(Topic topic) { this.topic = topic; }
//
//}
package com.example.SkillForge_1.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "materials")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long materialId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType materialType; // PDF, VIDEO, IMAGE

    @Column(nullable = false, length = 2000)
    private String contentUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Topic topic;


    public Material() {}

    public Material(String title, MaterialType materialType, String contentUrl) {
        this.title = title;
        this.materialType = materialType;
        this.contentUrl = contentUrl;
    }

    // Getters & Setters
    public Long getMaterialId() { return materialId; }
    public void setMaterialId(Long materialId) { this.materialId = materialId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public MaterialType getMaterialType() { return materialType; }
    public void setMaterialType(MaterialType materialType) { this.materialType = materialType; }

    public String getContentUrl() { return contentUrl; }
    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }

    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }
}
