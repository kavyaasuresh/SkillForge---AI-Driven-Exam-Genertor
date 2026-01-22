//package com.example.SkillForge_1.model;
//
//import jakarta.persistence.*;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "courses")
//public class Course {
//
//    @Id
//    @Column(name = "course_id")
//    private String courseId;
//
//    private String name;
//    private String description;
//    private String difficulty;
//    private Integer studentStrength;
//
//    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Topic> topics = new ArrayList<>();
//
//    // ===== getters & setters =====
//
//    public String getCourseId() {
//        return courseId;
//    }
//
//    public void setCourseId(String courseId) {
//        this.courseId = courseId;
//    }
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public String getDescription() {
//        return description;
//    }
//
//    public void setDescription(String description) {
//        this.description = description;
//    }
//
//    public String getDifficulty() {
//        return difficulty;
//    }
//
//    public void setDifficulty(String difficulty) {
//        this.difficulty = difficulty;
//    }
//
//    public Integer getStudentStrength() {
//        return studentStrength;
//    }
//
//    public void setStudentStrength(Integer studentStrength) {
//        this.studentStrength = studentStrength;
//    }
//
//    public List<Topic> getTopics() {
//        return topics;
//    }
//
//    public void setTopics(List<Topic> topics) {
//        this.topics = topics;
//    }
//}
package com.example.SkillForge_1.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @Column(name = "course_id")
    @JsonProperty("course_id")
    private String courseId;

    @JsonProperty("course_title")
    private String name;

    private String description;
    private String difficulty;

    @JsonProperty("student_strength")
    private Integer studentStrength;

    @JsonProperty("instructor_id")
    private String instructorId;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Topic> topics = new ArrayList<>();

    public Course() {}

    // getters & setters
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getStudentStrength() { return studentStrength; }
    public void setStudentStrength(Integer studentStrength) { this.studentStrength = studentStrength; }

    public String getInstructorId() { return instructorId; }
    public void setInstructorId(String instructorId) { this.instructorId = instructorId; }

    public List<Topic> getTopics() { return topics; }
    public void setTopics(List<Topic> topics) { this.topics = topics; }
}
