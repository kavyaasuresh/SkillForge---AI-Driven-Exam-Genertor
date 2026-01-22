//package com.example.SkillForge_1.service;
//
//import com.example.SkillForge_1.model.Course;
//import com.example.SkillForge_1.model.Material;
//import com.example.SkillForge_1.model.Topic;
//import com.example.SkillForge_1.repository.CourseRepository;
//import com.example.SkillForge_1.repository.MaterialRepository;
//import com.example.SkillForge_1.repository.TopicRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//@Service
//public class CourseServiceImpl implements CourseService {
//
//    @Autowired
//    private CourseRepository courseRepository;
//
//    @Autowired
//    private TopicRepository topicRepository;
//
//    @Autowired
//    private MaterialRepository materialRepository;
//
//    @Override
//    public List<Course> getAllCourses() {
//        return courseRepository.findAll();
//    }
//
//    @Override
//    public Course getCourseById(String courseId) {
//        return courseRepository.findById(courseId)
//                .orElseThrow(() -> new RuntimeException("Course not found"));
//    }
//
//    @Override
//    public Course saveCourse(Course course) {
//        return courseRepository.save(course);
//    }
//
//    @Override
//    public void deleteCourse(String courseId) {
//        courseRepository.deleteById(courseId);
//    }
//
//    // ✅ SAVE TOPIC (correct)
//    @Override
//    public Course saveTopic(String courseId, Topic topic) {
//        Course course = getCourseById(courseId);
//
//        topic.setCourse(course);          // link topic → course
//        course.getTopics().add(topic);    // add topic to course
//
//        return courseRepository.save(course); // 🔥 RETURN COURSE
//    }
//
//    // ✅ ADD MATERIAL (correct)
//    @Override
//    public Material addMaterial(Long topicId, Material material) {
//        Topic topic = topicRepository.findById(topicId)
//                .orElseThrow(() -> new RuntimeException("Topic not found"));
//
//        topic.getMaterials().add(material);
//        topicRepository.save(topic);
//        return material;
//    }
//}
package com.example.SkillForge_1.service;

import com.example.SkillForge_1.model.Course;
import com.example.SkillForge_1.model.Topic;
import com.example.SkillForge_1.repository.CourseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    public CourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course getCourseById(String courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Override
    public Course saveCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    public void deleteCourse(String courseId) {
        courseRepository.deleteById(courseId);
    }

    @Override
    public Course saveTopic(String courseId, Topic topic) {
        Course course = getCourseById(courseId);
        topic.setCourse(course);
        course.getTopics().add(topic);
        return courseRepository.save(course);
    }
}
