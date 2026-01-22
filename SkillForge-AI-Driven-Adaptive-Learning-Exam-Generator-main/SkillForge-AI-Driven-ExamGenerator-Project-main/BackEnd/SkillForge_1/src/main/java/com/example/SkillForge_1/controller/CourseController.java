//package com.example.SkillForge_1.controller;
//
//import com.example.SkillForge_1.model.Course;
//import com.example.SkillForge_1.model.Material;
//import com.example.SkillForge_1.model.Topic;
//import com.example.SkillForge_1.service.CourseService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/course")
//@CrossOrigin(origins = "http://localhost:5173") // frontend URL for CORS
//public class CourseController {
//
//    @Autowired
//    private CourseService courseService;
//
//    @GetMapping
//    public List<Course> getAllCourses() {
//        return courseService.getAllCourses();
//    }
//
//    @GetMapping("/{id}")
//    public Course getCourseById(@PathVariable String id) {
//        return courseService.getCourseById(id);
//    }
//
//    @PostMapping
//    public Course createCourse(@RequestBody Course course) {
//        return courseService.saveCourse(course);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteCourse(@PathVariable String id) {
//        courseService.deleteCourse(id);
//    }
//
//    @PostMapping("/{courseId}/topics")
//    public Course addTopic(@PathVariable String courseId, @RequestBody Topic topic) {
//        return courseService.saveTopic(courseId, topic);
//    }
//
//    @PostMapping("/{courseId}/topics/{topicIndex}/materials")
//    public Course addMaterial(@PathVariable String courseId,
//                              @PathVariable int topicIndex,
//                              @RequestBody Material material) {
//        return courseService.addMaterial(courseId, topicIndex, material);
//    }
//    @PutMapping("/{id}")
//    public Course updateCourse(@PathVariable String id, @RequestBody Course course) {
//        course.setCourse_id(id); // now works
//        return courseService.saveCourse(course);
//    }
//
//}
package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.model.Course;
import com.example.SkillForge_1.model.Topic;
import com.example.SkillForge_1.service.CourseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.saveCourse(course);
    }

    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable String id, @RequestBody Course course) {
        course.setCourseId(id);
        return courseService.saveCourse(course);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
    }

    @PostMapping("/{courseId}/topics")
    public Course addTopic(@PathVariable String courseId, @RequestBody Topic topic) {
        return courseService.saveTopic(courseId, topic);
    }
}
