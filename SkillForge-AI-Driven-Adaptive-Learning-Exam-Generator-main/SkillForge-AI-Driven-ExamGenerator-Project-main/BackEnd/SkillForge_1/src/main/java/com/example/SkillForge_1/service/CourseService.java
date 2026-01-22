//package com.example.SkillForge_1.service;
//
//import com.example.SkillForge_1.model.Course;
//import com.example.SkillForge_1.model.Material;
//import com.example.SkillForge_1.model.Topic;
//
//import java.util.List;
//public interface CourseService {
//
//    List<Course> getAllCourses();
//
//    Course getCourseById(String courseId);
//
//    Course saveCourse(Course course);
//
//    void deleteCourse(String courseId);
//
//    Course saveTopic(String courseId, Topic topic);
//
//    Material addMaterial(Long topicId, Material material);
//}

package com.example.SkillForge_1.service;

import com.example.SkillForge_1.model.Course;
import com.example.SkillForge_1.model.Topic;
import java.util.List;

public interface CourseService {
    List<Course> getAllCourses();
    Course getCourseById(String courseId);
    Course saveCourse(Course course);
    void deleteCourse(String courseId);
    Course saveTopic(String courseId, Topic topic);
}
