package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.CoursePerformanceDTO;
import com.example.SkillForge_1.dto.StudentQuizScoreDTO;
import com.example.SkillForge_1.repository.AnalyticsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    // 1️⃣ Student Quiz Scores
    public List<StudentQuizScoreDTO> getStudentQuizScores() {
        List<Object[]> rawData = analyticsRepository.getStudentQuizScores();
        List<StudentQuizScoreDTO> result = new java.util.ArrayList<>();

        for (Object[] row : rawData) {
            Long studentId = (Long) row[0];
            String studentName = (String) row[1];
            Long quizId = (Long) row[2];
            String quizTitle = (String) row[3];
            String topicName = (String) row[4];
            String difficulty = (String) row[5];
            
            // Handle potentially null numbers from DB
            Double score = row[6] != null ? ((Number) row[6]).doubleValue() : 0.0;
            Integer totalMarks = row[7] != null ? ((Number) row[7]).intValue() : 0;
            java.time.LocalDateTime submittedAt = (java.time.LocalDateTime) row[8];
            String status = (String) row[9];

            Double percentage = (totalMarks > 0 && score > 0) ? (score * 100.0 / totalMarks) : 0.0;

            result.add(new StudentQuizScoreDTO(
                studentId, studentName, quizId, quizTitle, topicName, difficulty,
                score, totalMarks, percentage, status, submittedAt
            ));
        }
        return result;
    }


    // 2️⃣ Course Performance
    public List<CoursePerformanceDTO> getCoursePerformance() {
        // Fetch raw data: [CourseName, StudentId, StudentName, TotalScore, TotalMaxMarks]
        List<Object[]> rawData = analyticsRepository.getRawCoursePerformanceData();
        
        Map<String, CoursePerformanceDTO> courseMap = new java.util.HashMap<>();

        for (Object[] row : rawData) {
            String courseName = (String) row[0];
            Long studentId = (Long) row[1];
            String studentName = (String) row[2];
            Long totalScore = ((Number) row[3]).longValue();
            Long totalMarks = ((Number) row[4]).longValue();

            double percentage = (totalMarks > 0) ? (totalScore * 100.0 / totalMarks) : 0.0;

            // Get or create course DTO
            CoursePerformanceDTO courseDTO = courseMap.computeIfAbsent(courseName, k -> new CoursePerformanceDTO(k, 0.0));
            
            // Add student performance
            courseDTO.getStudents().add(new CoursePerformanceDTO.StudentPerformanceDTO(studentId, studentName, percentage));
        }

        // Calculate average for each course and finalize list
        List<CoursePerformanceDTO> result = new java.util.ArrayList<>(courseMap.values());
        for (CoursePerformanceDTO dto : result) {
            if (!dto.getStudents().isEmpty()) {
                double avg = dto.getStudents().stream()
                        .mapToDouble(CoursePerformanceDTO.StudentPerformanceDTO::getPercentage)
                        .average()
                        .orElse(0.0);
                dto.setAverageScore(avg);
            }
        }
        
        return result;
    }


    // 3️⃣ Topic Performance
    public List<Map<String, Object>> getTopicPerformance() {
        return analyticsRepository.getTopicPerformance();
    }

    // 4️⃣ Adaptive Skill Progression
    public List<Map<String, Object>> getSkillProgression() {
        return analyticsRepository.getSkillProgression();
    }
    
    // 5️⃣ Daily Student Involvement
    public List<Map<String, Object>> getDailyStudentInvolvement() {
        return analyticsRepository.getDailyStudentInvolvement();
    }
    
    // 6️⃣ Student Performance by Course
    public List<Map<String, Object>> getStudentPerformanceByCourse(String courseName) {
        return analyticsRepository.getStudentPerformanceByCourse(courseName);
    }
    
    // 7️⃣ Overall Course Performance
    public List<Map<String, Object>> getOverallCoursePerformance() {
        return analyticsRepository.getOverallCoursePerformance();
    }
    
    // 5️⃣ Student Detailed Analytics
    public Map<String, Object> getStudentDetailedAnalytics(Long studentId) {
        Map<String, Object> result = new java.util.HashMap<>();
        
        // Student info
        Map<String, Object> studentInfo = analyticsRepository.getStudentInfo(studentId);
        if (studentInfo == null) {
            studentInfo = new java.util.HashMap<>();
            studentInfo.put("id", studentId);
            studentInfo.put("name", "Student " + studentId);
            studentInfo.put("email", "student" + studentId + "@example.com");
        }
        result.put("studentInfo", studentInfo);
        
        // Course performance for this student
        List<Map<String, Object>> coursePerf = analyticsRepository.getStudentCoursePerformance(studentId);
        result.put("coursePerformance", coursePerf);
        
        // Topic performance for this student
        List<Map<String, Object>> topicPerf = analyticsRepository.getStudentTopicPerformance(studentId);
        result.put("topicPerformance", topicPerf);
        
        // Activity metrics
        Map<String, Object> metricsRaw = analyticsRepository.getStudentActivityMetrics(studentId);
        Map<String, Object> metrics = new java.util.HashMap<>();
        
        Long totalAssigned = metricsRaw.get("totalAssigned") != null 
            ? ((Number) metricsRaw.get("totalAssigned")).longValue() : 0L;
        Long totalAttempted = metricsRaw.get("totalAttempted") != null 
            ? ((Number) metricsRaw.get("totalAttempted")).longValue() : 0L;
        
        metrics.put("totalAssigned", totalAssigned);
        metrics.put("totalAttempted", totalAttempted);
        metrics.put("completionRate", totalAssigned > 0 
            ? Math.round((totalAttempted * 100.0 / totalAssigned)) : 0);
        result.put("activityMetrics", metrics);
        
        // Recent attempts
        List<Map<String, Object>> recentAttempts = analyticsRepository.getStudentRecentAttempts(studentId);
        result.put("recentAttempts", recentAttempts);
        
        return result;
    }
    
    // 8️⃣ Get All Students
    public List<Map<String, Object>> getAllStudents() {
        return analyticsRepository.getAllStudents();
    }
    
    // 10️⃣ Quiz Analytics
    public Map<String, Object> getQuizAnalytics(Long quizId) {
        Map<String, Object> basicAnalytics = analyticsRepository.getQuizAnalytics(quizId);
        
        // Get detailed attempts and assignments
        List<Map<String, Object>> attempts = getQuizAttempts(quizId);
        List<Map<String, Object>> assignedStudents = getQuizAssignments(quizId);
        
        // Merge basic analytics with detailed data
        Map<String, Object> result = new java.util.HashMap<>(basicAnalytics);
        result.put("attempts", attempts);
        result.put("assignedStudents", assignedStudents);
        
        return result;
    }
    
    // Helper method to get quiz attempts
    private List<Map<String, Object>> getQuizAttempts(Long quizId) {
        return analyticsRepository.getQuizAttempts(quizId);
    }
    
    // Helper method to get quiz assignments
    private List<Map<String, Object>> getQuizAssignments(Long quizId) {
        return analyticsRepository.getQuizAssignments(quizId);
    }
    
    // 9️⃣ Get Student ID by Username
    public Long getStudentIdByUsername(String username) {
        return analyticsRepository.getStudentIdByUsername(username);
    }
}
