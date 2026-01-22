# Quiz Analytics Backend API Endpoints

This document outlines the required backend endpoints for the Quiz Analytics and Management system.

## 📋 Required Endpoints

### 1. Get Quiz Analytics
**Endpoint:** `GET /api/instructor/quiz/{quizId}/analytics`

**Description:** Returns comprehensive analytics for a specific quiz including questions and all student attempts.

**Response Structure:**
```json
{
  "quizId": 26,
  "title": "OOPS Quiz",
  "difficulty": "MEDIUM",
  "topicId": 3,
  "totalMarks": 100,
  "timeLimit": 30,
  "questions": [
    {
      "questionId": 35,
      "question": "What is the primary characteristic of an 'Object' in OOP?",
      "questionText": "What is the primary characteristic of an 'Object' in OOP?",
      "type": "MCQ",
      "optionA": "A set of instructions",
      "optionB": "An instance of a class",
      "optionC": "A compiler directive",
      "optionD": "A variable declaration",
      "options": ["A set of instructions", "An instance of a class", "A compiler directive", "A variable declaration"],
      "correctAnswer": "B"
    }
  ],
  "attempts": [
    {
      "attemptId": 123,
      "studentId": 6,
      "studentName": "Anaya",
      "score": 85.5,
      "submittedAt": "2026-01-08T10:30:00",
      "answers": {
        "35": "B",
        "36": "C"
      }
    }
  ],
  "assignedStudents": [
    {
      "studentId": 6,
      "name": "Anaya",
      "email": "anaya@example.com"
    }
  ],
  "statistics": {
    "totalAssigned": 10,
    "totalAttempted": 7,
    "averageScore": 75.5,
    "completionRate": 70.0
  }
}
```

**Java Controller Example:**
```java
@GetMapping("/quiz/{quizId}/analytics")
public ResponseEntity<?> getQuizAnalytics(@PathVariable Long quizId) {
    Quiz quiz = quizRepository.findById(quizId)
        .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
    
    // Get all attempts for this quiz
    List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);
    
    // Get assigned students
    List<QuizAssignment> assignments = quizAssignmentRepository.findByQuizId(quizId);
    
    // Build analytics response
    QuizAnalyticsDTO analytics = new QuizAnalyticsDTO();
    analytics.setQuizId(quiz.getQuizId());
    analytics.setTitle(quiz.getTitle());
    analytics.setDifficulty(quiz.getDifficulty());
    analytics.setQuestions(quiz.getQuestions());
    analytics.setAttempts(attempts.stream()
        .map(attempt -> {
            AttemptDTO dto = new AttemptDTO();
            dto.setAttemptId(attempt.getId());
            dto.setStudentId(attempt.getStudentId());
            dto.setStudentName(attempt.getStudent().getName());
            dto.setScore(attempt.getScore());
            dto.setSubmittedAt(attempt.getSubmittedAt());
            dto.setAnswers(attempt.getAnswers());
            return dto;
        })
        .collect(Collectors.toList()));
    analytics.setAssignedStudents(assignments.stream()
        .map(QuizAssignment::getStudent)
        .collect(Collectors.toList()));
    
    // Calculate statistics
    StatisticsDTO stats = new StatisticsDTO();
    stats.setTotalAssigned(assignments.size());
    stats.setTotalAttempted(attempts.size());
    stats.setAverageScore(attempts.stream()
        .mapToDouble(QuizAttempt::getScore)
        .average()
        .orElse(0.0));
    stats.setCompletionRate((double) attempts.size() / assignments.size() * 100);
    analytics.setStatistics(stats);
    
    return ResponseEntity.ok(analytics);
}
```

---

### 2. Get Quiz Attempts
**Endpoint:** `GET /api/instructor/quiz/{quizId}/attempts`

**Description:** Returns all student attempts for a specific quiz.

**Response Structure:**
```json
[
  {
    "attemptId": 123,
    "studentId": 6,
    "studentName": "Anaya",
    "studentEmail": "anaya@example.com",
    "score": 85.5,
    "totalQuestions": 5,
    "correctAnswers": 4,
    "submittedAt": "2026-01-08T10:30:00",
    "timeTaken": 25,
    "answers": {
      "35": "B",
      "36": "C",
      "37": "B",
      "38": "D",
      "39": "C"
    }
  }
]
```

**Java Controller Example:**
```java
@GetMapping("/quiz/{quizId}/attempts")
public ResponseEntity<List<AttemptDTO>> getQuizAttempts(@PathVariable Long quizId) {
    List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);
    
    List<AttemptDTO> attemptDTOs = attempts.stream()
        .map(attempt -> {
            AttemptDTO dto = new AttemptDTO();
            dto.setAttemptId(attempt.getId());
            dto.setStudentId(attempt.getStudentId());
            dto.setStudentName(attempt.getStudent().getName());
            dto.setStudentEmail(attempt.getStudent().getEmail());
            dto.setScore(attempt.getScore());
            dto.setSubmittedAt(attempt.getSubmittedAt());
            dto.setAnswers(attempt.getAnswers());
            return dto;
        })
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(attemptDTOs);
}
```

---

### 3. Get Quiz Details
**Endpoint:** `GET /api/instructor/quiz/{quizId}/details`

**Description:** Returns full quiz details including all questions (for editing).

**Response Structure:**
```json
{
  "quizId": 26,
  "title": "OOPS Quiz",
  "description": "Test your OOP knowledge",
  "difficulty": "MEDIUM",
  "topicId": 3,
  "totalMarks": 100,
  "timeLimit": 30,
  "active": true,
  "questions": [
    {
      "questionId": 35,
      "question": "What is the primary characteristic of an 'Object' in OOP?",
      "questionText": "What is the primary characteristic of an 'Object' in OOP?",
      "type": "MCQ",
      "optionA": "A set of instructions",
      "optionB": "An instance of a class",
      "optionC": "A compiler directive",
      "optionD": "A variable declaration",
      "options": ["A set of instructions", "An instance of a class", "A compiler directive", "A variable declaration"],
      "correctAnswer": "B"
    }
  ],
  "assignedStudentIds": [6, 7, 8]
}
```

**Java Controller Example:**
```java
@GetMapping("/quiz/{quizId}/details")
public ResponseEntity<QuizDetailsDTO> getQuizDetails(@PathVariable Long quizId) {
    Quiz quiz = quizRepository.findById(quizId)
        .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
    
    List<QuizAssignment> assignments = quizAssignmentRepository.findByQuizId(quizId);
    
    QuizDetailsDTO details = new QuizDetailsDTO();
    details.setQuizId(quiz.getQuizId());
    details.setTitle(quiz.getTitle());
    details.setDifficulty(quiz.getDifficulty());
    details.setTopicId(quiz.getTopicId());
    details.setTotalMarks(quiz.getTotalMarks());
    details.setTimeLimit(quiz.getTimeLimit());
    details.setQuestions(quiz.getQuestions());
    details.setAssignedStudentIds(assignments.stream()
        .map(a -> a.getStudent().getStudentId())
        .collect(Collectors.toList()));
    
    return ResponseEntity.ok(details);
}
```

---

### 4. Update Existing Quiz (Already exists, but ensure it works)
**Endpoint:** `PUT /api/instructor/quiz/{quizId}`

**Request Body:**
```json
{
  "title": "Updated OOPS Quiz",
  "difficulty": "ADVANCED",
  "totalMarks": 100,
  "timeLimit": 45,
  "topicId": 3,
  "questions": [...],
  "assignedStudentIds": [6, 7, 8, 9]
}
```

---

## 📊 Database Schema Considerations

### QuizAttempt Table
```sql
CREATE TABLE quiz_attempt (
    attempt_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    score DECIMAL(5,2),
    answers JSON,  -- Store as JSON: {"questionId": "answer"}
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken INT,  -- in minutes
    FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id)
);
```

### QuizAssignment Table
```sql
CREATE TABLE quiz_assignment (
    assignment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, COMPLETED
    FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    UNIQUE KEY unique_assignment (quiz_id, student_id)
);
```

---

## 🔧 Repository Methods Needed

### QuizAttemptRepository
```java
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByStudentId(Long studentId);
    Optional<QuizAttempt> findByQuizIdAndStudentId(Long quizId, Long studentId);
    
    @Query("SELECT AVG(qa.score) FROM QuizAttempt qa WHERE qa.quizId = :quizId")
    Double getAverageScoreByQuizId(@Param("quizId") Long quizId);
}
```

### QuizAssignmentRepository
```java
public interface QuizAssignmentRepository extends JpaRepository<QuizAssignment, Long> {
    List<QuizAssignment> findByQuizId(Long quizId);
    List<QuizAssignment> findByStudentId(Long studentId);
    Optional<QuizAssignment> findByQuizIdAndStudentId(Long quizId, Long studentId);
    
    @Query("SELECT COUNT(qa) FROM QuizAssignment qa WHERE qa.quizId = :quizId")
    Long countAssignmentsByQuizId(@Param("quizId") Long quizId);
}
```

---

## 🎯 DTO Classes Needed

### QuizAnalyticsDTO.java
```java
@Data
public class QuizAnalyticsDTO {
    private Long quizId;
    private String title;
    private String difficulty;
    private Integer topicId;
    private Integer totalMarks;
    private Integer timeLimit;
    private List<QuizQuestion> questions;
    private List<AttemptDTO> attempts;
    private List<StudentDTO> assignedStudents;
    private StatisticsDTO statistics;
}
```

### AttemptDTO.java
```java
@Data
public class AttemptDTO {
    private Long attemptId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Double score;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private LocalDateTime submittedAt;
    private Integer timeTaken;
    private Map<String, String> answers;
}
```

### StatisticsDTO.java
```java
@Data
public class StatisticsDTO {
    private Integer totalAssigned;
    private Integer totalAttempted;
    private Double averageScore;
    private Double completionRate;
}
```

---

## 🚀 Testing the Endpoints

Use these curl commands to test:

```bash
# Get Quiz Analytics
curl -X GET "http://localhost:8081/api/instructor/quiz/26/analytics" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Quiz Attempts
curl -X GET "http://localhost:8081/api/instructor/quiz/26/attempts" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Quiz Details
curl -X GET "http://localhost:8081/api/instructor/quiz/26/details" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notes

1. **Security**: All endpoints should be protected with `@PreAuthorize("hasRole('INSTRUCTOR')")`
2. **Error Handling**: Return appropriate HTTP status codes (404 for not found, 403 for unauthorized)
3. **Performance**: Consider caching quiz analytics if the data doesn't change frequently
4. **Pagination**: For large numbers of attempts, consider adding pagination support
