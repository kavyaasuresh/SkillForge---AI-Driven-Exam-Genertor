package com.example.SkillForge_1.repository;

import com.example.SkillForge_1.dto.CoursePerformanceDTO;
import com.example.SkillForge_1.dto.StudentQuizScoreDTO;
import com.example.SkillForge_1.model.StudentQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface AnalyticsRepository extends JpaRepository<StudentQuizAttempt, Long> {

    // 1️⃣ Student Quiz Scores - Raw Data to avoid Constructor Mismatch
    @Query("""
SELECT 
    s.id,
    u.name,
    q.quizId,
    q.title,
    COALESCE(t.name, q.topic, 'General Knowledge'),
    q.difficulty,
    COALESCE(a.score, 0),
    q.totalMarks,
    a.submittedAt,
    CASE 
        WHEN a.attemptId IS NULL THEN 'NOT_ATTEMPTED'
        WHEN a.status = 'PENDING_MANUAL_EVALUATION' THEN 'PENDING_REVIEW'
        ELSE 'COMPLETED'
    END
FROM StudentQuizAssignment sa
JOIN sa.student s
JOIN s.user u
JOIN sa.quiz q
LEFT JOIN Topic t ON t.id = q.topicId
LEFT JOIN StudentQuizAttempt a ON a.assignment.id = sa.id AND a.submittedAt IS NOT NULL
""")
    List<Object[]> getStudentQuizScores();

    // 2️⃣ Course Performance - Raw Data for Service-level aggregation
    @Query("""
    SELECT 
        COALESCE(c.name, t.name, q.topic, 'General Knowledge'),
        s.id,
        u.name,
        SUM(a.score),
        SUM(q.totalMarks)
    FROM StudentQuizAttempt a
    JOIN a.student u
    JOIN a.assignment sa
    JOIN sa.student s
    JOIN sa.quiz q
    LEFT JOIN Topic t ON t.id = q.topicId
    LEFT JOIN t.course c
    WHERE q.totalMarks > 0 AND a.submittedAt IS NOT NULL
    GROUP BY COALESCE(c.name, t.name, q.topic, 'General Knowledge'), s.id, u.name
""")
    List<Object[]> getRawCoursePerformanceData();

    // Deprecated simple aggregation
    @Query("""
    SELECT new com.example.SkillForge_1.dto.CoursePerformanceDTO(
        COALESCE(c.name, t.name, q.topic, 'General Knowledge'),
        AVG(a.score * 100.0 / NULLIF(q.totalMarks, 0))
    )
    FROM StudentQuizAttempt a
    JOIN a.assignment sa
    JOIN sa.quiz q
    LEFT JOIN Topic t ON t.id = q.topicId
    LEFT JOIN t.course c
    WHERE q.totalMarks > 0 AND a.submittedAt IS NOT NULL
    GROUP BY COALESCE(c.name, t.name, q.topic, 'General Knowledge')
""")
    List<CoursePerformanceDTO> getCoursePerformance();

    // 3️⃣ Topic Performance
    @Query("""
        SELECT 
            COALESCE(t.name, q.topic, 'General Knowledge') as topicName,
            AVG(a.score*100.0/NULLIF(q.totalMarks, 0)) as percentage,
            q.difficulty as difficulty
        FROM StudentQuizAttempt a
        JOIN a.assignment sa
        JOIN sa.quiz q
        LEFT JOIN Topic t ON t.id = q.topicId
        WHERE q.totalMarks > 0 AND a.submittedAt IS NOT NULL
        GROUP BY COALESCE(t.name, q.topic, 'General Knowledge'), q.difficulty
    """)
    List<Map<String, Object>> getTopicPerformance();

    // 4️⃣ Adaptive Skill Progression - Shows difficulty progression over time
    @Query("""
        SELECT 
            CAST(a.submittedAt AS date) as date,
            q.difficulty as difficulty,
            CASE 
                WHEN UPPER(q.difficulty) LIKE '%EASY%' OR UPPER(q.difficulty) LIKE '%BEGINNER%' THEN 1
                WHEN UPPER(q.difficulty) LIKE '%MEDIUM%' OR UPPER(q.difficulty) LIKE '%INTERMEDIATE%' THEN 2
                WHEN UPPER(q.difficulty) LIKE '%HARD%' OR UPPER(q.difficulty) LIKE '%ADVANCED%' THEN 3
                ELSE 1
            END as difficultyLevel,
            AVG(a.score*100.0/NULLIF(q.totalMarks, 0)) as percentage,
            COUNT(a.attemptId) as attemptCount
        FROM StudentQuizAttempt a
        JOIN a.assignment sa
        JOIN sa.quiz q
        WHERE a.submittedAt IS NOT NULL AND q.totalMarks > 0
        GROUP BY CAST(a.submittedAt AS date), q.difficulty
        ORDER BY CAST(a.submittedAt AS date)
    """)
    List<Map<String, Object>> getSkillProgression();
    
    // 5️⃣ Daily Student Involvement
    @Query("""
        SELECT 
            CAST(a.submittedAt AS date) as date,
            COUNT(DISTINCT a.student.id) as studentCount,
            COUNT(a.attemptId) as attemptCount
        FROM StudentQuizAttempt a
        WHERE a.submittedAt IS NOT NULL
        GROUP BY CAST(a.submittedAt AS date)
        ORDER BY CAST(a.submittedAt AS date)
    """)
    List<Map<String, Object>> getDailyStudentInvolvement();
    
    // 6️⃣ Student Performance by Course
    @Query("""
        SELECT 
            u.name as studentName,
            AVG(a.score*100.0/NULLIF(q.totalMarks, 0)) as avgPercentage
        FROM StudentQuizAttempt a
        JOIN a.student u
        JOIN a.assignment sa
        JOIN sa.quiz q
        LEFT JOIN Topic t ON t.id = q.topicId
        LEFT JOIN t.course c
        WHERE a.submittedAt IS NOT NULL 
            AND q.totalMarks > 0
            AND (c.name = :courseName OR (c.name IS NULL AND COALESCE(t.name, q.topic) = :courseName))
        GROUP BY u.name
    """)
    List<Map<String, Object>> getStudentPerformanceByCourse(@Param("courseName") String courseName);
    
    // 7️⃣ Overall Course Performance
    @Query("""
        SELECT 
            COALESCE(c.name, t.name, q.topic, 'General Knowledge') as courseName,
            AVG(a.score*100.0/NULLIF(q.totalMarks, 0)) as avgPercentage,
            COUNT(a.attemptId) as attemptCount
        FROM StudentQuizAttempt a
        JOIN a.assignment sa
        JOIN sa.quiz q
        LEFT JOIN Topic t ON t.id = q.topicId
        LEFT JOIN t.course c
        WHERE a.submittedAt IS NOT NULL AND q.totalMarks > 0
        GROUP BY COALESCE(c.name, t.name, q.topic, 'General Knowledge')
    """)
    List<Map<String, Object>> getOverallCoursePerformance();
    
    // 8️⃣ Get All Students
    @Query("""
        SELECT 
            s.id as studentId,
            u.name as name,
            u.email as email
        FROM Student s
        JOIN s.user u
        ORDER BY u.name
    """)
    List<Map<String, Object>> getAllStudents();
    
    // 9️⃣ Get Student Info
    @Query("""
        SELECT 
            s.id as studentId,
            u.name as name,
            u.email as email
        FROM Student s
        JOIN s.user u
        WHERE s.id = :studentId
    """)
    Map<String, Object> getStudentInfo(@Param("studentId") Long studentId);
    
    // 🔟 Get Student Course Performance
    @Query("""
        SELECT 
            COALESCE(c.name, t.name, q.topic, 'General Knowledge') as courseName,
            AVG(a.score*100.0/NULLIF(q.totalMarks, 0)) as percentage
        FROM StudentQuizAttempt a
        JOIN a.assignment sa
        JOIN sa.quiz q
        LEFT JOIN Topic t ON t.id = q.topicId
        LEFT JOIN t.course c
        WHERE a.student.id = :studentId AND a.submittedAt IS NOT NULL AND q.totalMarks > 0
        GROUP BY COALESCE(c.name, t.name, q.topic, 'General Knowledge')
    """)
    List<Map<String, Object>> getStudentCoursePerformance(@Param("studentId") Long studentId);
    
    // 1️⃣1️⃣ Get Student Topic Performance
    @Query("""
        SELECT 
            COALESCE(t.name, q.topic, 'General Knowledge') as topicName,
            t.id as topicId,
            AVG(a.score*100.0/NULLIF(q.totalMarks, 0)) as percentage
        FROM StudentQuizAttempt a
        JOIN a.assignment sa
        JOIN sa.quiz q
        LEFT JOIN Topic t ON t.id = q.topicId
        WHERE a.student.id = :studentId AND a.submittedAt IS NOT NULL AND q.totalMarks > 0
        GROUP BY COALESCE(t.name, q.topic, 'General Knowledge'), t.id
    """)
    List<Map<String, Object>> getStudentTopicPerformance(@Param("studentId") Long studentId);
    
    // 1️⃣2️⃣ Get Student Activity Metrics
    @Query("""
        SELECT 
            COUNT(sa.id) as totalAssigned,
            COUNT(a.attemptId) as totalAttempted
        FROM StudentQuizAssignment sa
        LEFT JOIN StudentQuizAttempt a ON a.assignment.id = sa.id AND a.submittedAt IS NOT NULL
        WHERE sa.student.id = :studentId
    """)
    Map<String, Object> getStudentActivityMetrics(@Param("studentId") Long studentId);
    
    // 1️⃣3️⃣ Get Student Recent Attempts
    @Query("""
        SELECT 
            q.quizId as quizId,
            q.title as quizTitle,
            a.score*100.0/NULLIF(q.totalMarks, 0) as score,
            a.submittedAt as date,
            CASE 
                WHEN a.status = 'PENDING_MANUAL_EVALUATION' THEN 'PENDING_REVIEW'
                ELSE 'COMPLETED'
            END as status
        FROM StudentQuizAttempt a
        JOIN a.assignment sa
        JOIN sa.quiz q
        WHERE a.student.id = :studentId AND a.submittedAt IS NOT NULL
        ORDER BY a.submittedAt DESC
    """)
    List<Map<String, Object>> getStudentRecentAttempts(@Param("studentId") Long studentId);
    
    // 1️⃣5️⃣ Get Quiz Analytics - Simplified version
    @Query(value = """
        SELECT 
            q.quiz_id as quizId,
            q.title as title,
            q.difficulty as difficulty,
            q.total_marks as totalMarks,
            (SELECT COUNT(*) FROM student_quiz_assignment WHERE quiz_id = :quizId) as totalAssigned,
            (SELECT COUNT(*) FROM student_quiz_attempt WHERE quiz_id = :quizId AND submitted_at IS NOT NULL) as totalAttempted,
            (SELECT AVG(score * 100.0 / q.total_marks) FROM student_quiz_attempt WHERE quiz_id = :quizId AND submitted_at IS NOT NULL) as avgScore
        FROM quiz q
        WHERE q.quiz_id = :quizId
    """, nativeQuery = true)
    Map<String, Object> getQuizAnalytics(@Param("quizId") Long quizId);
    
    // Get quiz attempts with student details
    @Query(value = """
        SELECT 
            a.attempt_id as id,
            a.attempt_id as attemptId,
            a.student_id as studentId,
            u.name as studentName,
            a.score as score,
            a.submitted_at as submittedAt,
            a.status as evaluationStatus
        FROM student_quiz_attempt a
        JOIN users u ON u.id = a.student_id
        WHERE a.quiz_id = :quizId AND a.submitted_at IS NOT NULL
        ORDER BY a.submitted_at DESC
    """, nativeQuery = true)
    List<Map<String, Object>> getQuizAttempts(@Param("quizId") Long quizId);
    
    // Get quiz assignments with student details
    @Query(value = """
        SELECT 
            sa.id as id,
            sa.student_id as studentId,
            u.name as name,
            sa.status as status
        FROM student_quiz_assignment sa
        JOIN users u ON u.id = sa.student_id
        WHERE sa.quiz_id = :quizId
        ORDER BY u.name
    """, nativeQuery = true)
    List<Map<String, Object>> getQuizAssignments(@Param("quizId") Long quizId);
    
    // 1️⃣4️⃣ Get Student ID by Username
    @Query("""
        SELECT s.id
        FROM Student s
        JOIN s.user u
        WHERE u.email = :username OR u.name = :username
    """)
    Long getStudentIdByUsername(@Param("username") String username);
}
