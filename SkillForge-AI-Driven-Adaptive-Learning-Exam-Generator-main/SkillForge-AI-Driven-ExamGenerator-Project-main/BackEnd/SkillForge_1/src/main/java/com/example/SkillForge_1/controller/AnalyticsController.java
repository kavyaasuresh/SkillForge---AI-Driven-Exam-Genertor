package com.example.SkillForge_1.controller;
import com.example.SkillForge_1.dto.CoursePerformanceDTO;
import com.example.SkillForge_1.dto.StudentQuizScoreDTO;
import com.example.SkillForge_1.repository.AnalyticsRepository;
import com.example.SkillForge_1.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }
    @Autowired
    private AnalyticsRepository analyticsRepository;

    // 1️⃣ Student Quiz Scores (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/student-quiz-scores")
    public ResponseEntity<List<StudentQuizScoreDTO>> getStudentQuizScores(
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topic
    ) {
        List<StudentQuizScoreDTO> scores = analyticsService.getStudentQuizScores();
        
        // Apply filters
        if (studentName != null && !studentName.trim().isEmpty()) {
            String searchTerm = studentName.toLowerCase();
            scores = scores.stream()
                .filter(s -> s.getStudentName().toLowerCase().contains(searchTerm))
                .collect(java.util.stream.Collectors.toList());
        }
        
        if (difficulty != null && !difficulty.trim().isEmpty()) {
            scores = scores.stream()
                .filter(s -> s.getDifficulty() != null && 
                            s.getDifficulty().equalsIgnoreCase(difficulty))
                .collect(java.util.stream.Collectors.toList());
        }
        
        if (topic != null && !topic.trim().isEmpty()) {
            scores = scores.stream()
                .filter(s -> s.getTopicName() != null && 
                            s.getTopicName().equalsIgnoreCase(topic))
                .collect(java.util.stream.Collectors.toList());
        }
        
        return ResponseEntity.ok(scores);
    }




    // 2️⃣ Course Performance (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/course-performance")
    public List<CoursePerformanceDTO> getCoursePerformance() {
        return analyticsService.getCoursePerformance();
    }


    // 3️⃣ Topic Performance (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/topic-performance")
    public List<Map<String, Object>> getTopicPerformance() {
        return analyticsService.getTopicPerformance();
    }

    // 4️⃣ Adaptive Skill Progression (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/skill-progression")
    public List<Map<String, Object>> getSkillProgression() {
        return analyticsService.getSkillProgression();
    }
    
    // 5️⃣ Daily Student Involvement (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/daily-involvement")
    public ResponseEntity<List<Map<String, Object>>> getDailyStudentInvolvement() {
        return ResponseEntity.ok(analyticsService.getDailyStudentInvolvement());
    }
    
    // 6️⃣ Student Performance by Course (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/course/{courseName}/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentPerformanceByCourse(
            @PathVariable String courseName
    ) {
        return ResponseEntity.ok(analyticsService.getStudentPerformanceByCourse(courseName));
    }
    
    // 7️⃣ Overall Course Performance (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/overall-course-performance")
    public ResponseEntity<List<Map<String, Object>>> getOverallCoursePerformance() {
        return ResponseEntity.ok(analyticsService.getOverallCoursePerformance());
    }
    
    // 5️⃣ Student Detailed Analytics (Instructor only - for any student)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/student/{studentId}/detailed")
    public ResponseEntity<Map<String, Object>> getStudentDetailedAnalytics(@PathVariable Long studentId) {
        return ResponseEntity.ok(analyticsService.getStudentDetailedAnalytics(studentId));
    }
    
    // 8️⃣ Get All Students (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
        return ResponseEntity.ok(analyticsService.getAllStudents());
    }
    
    // 10️⃣ Quiz Analytics (Instructor only)
    @PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<Map<String, Object>> getQuizAnalytics(@PathVariable Long quizId) {
        return ResponseEntity.ok(analyticsService.getQuizAnalytics(quizId));
    }
    
    // 9️⃣ Student's Own Performance (Student only - their own data)
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @GetMapping("/my-performance")
    public ResponseEntity<Map<String, Object>> getMyPerformance(
            org.springframework.security.core.Authentication authentication
    ) {
        // Get student ID from authenticated user
        String username = authentication.getName();
        Long studentId = analyticsService.getStudentIdByUsername(username);
        return ResponseEntity.ok(analyticsService.getStudentDetailedAnalytics(studentId));
    }
}
