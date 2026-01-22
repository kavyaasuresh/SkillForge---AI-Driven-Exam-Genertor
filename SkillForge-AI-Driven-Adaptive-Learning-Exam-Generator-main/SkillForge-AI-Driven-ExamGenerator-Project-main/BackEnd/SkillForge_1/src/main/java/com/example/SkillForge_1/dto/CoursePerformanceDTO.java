package com.example.SkillForge_1.dto;
public class CoursePerformanceDTO {

    private Long courseId; // Using topicId as courseId equivalent
    private String courseName;
    private Double averageScore;
    private java.util.List<StudentPerformanceDTO> students;

    public CoursePerformanceDTO(String courseName, Double averageScore) {
        this.courseName = courseName;
        this.averageScore = averageScore;
        this.students = new java.util.ArrayList<>();
    }
    
    // Full constructor
    public CoursePerformanceDTO(Long courseId, String courseName, Double averageScore, java.util.List<StudentPerformanceDTO> students) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.averageScore = averageScore;
        this.students = students != null ? students : new java.util.ArrayList<>();
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    
    public java.util.List<StudentPerformanceDTO> getStudents() { return students; }
    public void setStudents(java.util.List<StudentPerformanceDTO> students) { this.students = students; }

    // Inner DTO for Student Performance
    public static class StudentPerformanceDTO {
        private Long studentId;
        private String studentName;
        private Double percentage;

        public StudentPerformanceDTO(Long studentId, String studentName, Double percentage) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.percentage = percentage;
        }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }
}

