# Student Performance Analytics Feature

## Overview
Added a student-facing performance analytics page that allows students to view their own personalized performance data. Students can only see their own analytics, while instructors can view all students' analytics.

## Changes Made

### 1. Frontend Changes

#### A. StudentPerformance.jsx (NEW)
**Location:** `FrontEnd-Antigravity/Anti-start/src/StudentPerformance.jsx`

**Features:**
- Displays student's own performance analytics
- Shows comprehensive charts and metrics
- Uses authentication to fetch only the logged-in student's data

**Components:**
1. **Summary Cards:**
   - Total Assigned Quizzes
   - Total Attempted Quizzes
   - Completion Rate
   - Active Courses

2. **Charts:**
   - Course-wise Performance Bar Chart
   - Activity Overview Pie Chart
   - Topic-wise Skill Profile Radar Chart
   - Score Distribution Histogram
   - Performance Trend Line Chart

3. **Performance Metrics:**
   - Max Score
   - Min Score
   - Average Score

4. **Strengths & Weaknesses:**
   - Strong Topics (>70%)
   - Areas to Improve (<40%)

5. **Recent Quiz History:**
   - All quiz attempts with scores and dates

#### B. SharedSidebar.jsx
**Location:** `FrontEnd-Antigravity/Anti-start/src/SharedSidebar.jsx`

**Changes:**
- Added "Performance Analytics" menu item for both students and instructors
- Students navigate to `/student/performance`
- Instructors navigate to `/instructor/performance-analytics`

#### C. App.jsx
**Location:** `FrontEnd-Antigravity/Anti-start/src/App.jsx`

**Changes:**
- Added route for student performance: `/student/performance`
- Protected with STUDENT role authorization
- Imported StudentPerformance component

#### D. analyticsService.js
**Location:** `FrontEnd-Antigravity/Anti-start/src/services/analyticsService.js`

**Added new method:**
```javascript
getMyPerformance: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/my-performance`, {
        headers: getAuthHeader()
    });
    return response.data;
}
```

### 2. Backend Changes

#### A. AnalyticsController.java
**Location:** `BackEnd/SkillForge_1/src/main/java/com/example/SkillForge_1/controller/AnalyticsController.java`

**Changes:**
1. Removed class-level `@PreAuthorize` annotation
2. Added method-level `@PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")` to all instructor-only endpoints
3. Added new student endpoint:

```java
// Student's Own Performance (Student only)
@PreAuthorize("hasAuthority('ROLE_STUDENT')")
@GetMapping("/my-performance")
public ResponseEntity<Map<String, Object>> getMyPerformance(
        Authentication authentication
) {
    String username = authentication.getName();
    Long studentId = analyticsService.getStudentIdByUsername(username);
    return ResponseEntity.ok(analyticsService.getStudentDetailedAnalytics(studentId));
}
```

**Endpoint Details:**
- **URL:** `GET /api/analytics/my-performance`
- **Authorization:** Requires `ROLE_STUDENT`
- **Authentication:** Uses Spring Security Authentication to get current user
- **Response:** Student's detailed analytics (same structure as instructor view)

#### B. AnalyticsService.java
**Location:** `BackEnd/SkillForge_1/src/main/java/com/example/SkillForge_1/service/AnalyticsService.java`

**Added new method:**
```java
// Get Student ID by Username
public Long getStudentIdByUsername(String username) {
    return analyticsRepository.getStudentIdByUsername(username);
}
```

#### C. AnalyticsRepository.java
**Location:** `BackEnd/SkillForge_1/src/main/java/com/example/SkillForge_1/repository/AnalyticsRepository.java`

**Added new query:**
```java
// Get Student ID by Username
@Query("""
    SELECT s.id
    FROM Student s
    JOIN s.user u
    WHERE u.email = :username OR u.name = :username
""")
Long getStudentIdByUsername(@Param("username") String username);
```

## Security Implementation

### Role-Based Access Control

**Instructor Endpoints (ROLE_INSTRUCTOR required):**
- `/api/analytics/student-quiz-scores` - All students' quiz scores
- `/api/analytics/course-performance` - Course performance data
- `/api/analytics/topic-performance` - Topic performance data
- `/api/analytics/skill-progression` - Skill progression data
- `/api/analytics/daily-involvement` - Daily involvement data
- `/api/analytics/course/{courseName}/students` - Students by course
- `/api/analytics/overall-course-performance` - Overall performance
- `/api/analytics/student/{studentId}/detailed` - Any student's details
- `/api/analytics/students` - All students list

**Student Endpoints (ROLE_STUDENT required):**
- `/api/analytics/my-performance` - Only their own performance data

### Authentication Flow

1. Student logs in and receives JWT token
2. Token is stored in localStorage
3. When accessing `/student/performance`, frontend calls `/api/analytics/my-performance`
4. Backend extracts username from JWT token via Spring Security Authentication
5. Backend queries database to get student ID for that username
6. Backend returns only that student's analytics data

## User Flow

### Student Flow
1. Student logs in to the application
2. Clicks "Performance Analytics" in sidebar
3. Navigates to `/student/performance`
4. Views their own comprehensive analytics:
   - Summary cards with key metrics
   - Multiple charts showing performance
   - Strengths and weaknesses
   - Areas to improve
   - Recent quiz history

### Instructor Flow (Unchanged)
1. Instructor logs in to the application
2. Clicks "Performance Analytics" in sidebar
3. Navigates to `/instructor/performance-analytics`
4. Views dashboard with all students
5. Clicks "View Details" for any student
6. Views that student's detailed analytics

## Data Privacy

- Students can ONLY see their own data
- Students cannot access other students' data
- Instructors can see all students' data
- Backend enforces security at the API level
- Frontend enforces security at the route level

## Features Comparison

| Feature | Student View | Instructor View |
|---------|-------------|-----------------|
| Own Performance | ✅ Yes | ✅ Yes (if they are also a student) |
| All Students List | ❌ No | ✅ Yes |
| Individual Student Details | ❌ No (only own) | ✅ Yes (any student) |
| Course Performance Charts | ✅ Yes (own) | ✅ Yes (all) |
| Topic Performance Charts | ✅ Yes (own) | ✅ Yes (all) |
| Activity Metrics | ✅ Yes (own) | ✅ Yes (all) |
| Strengths/Weaknesses | ✅ Yes (own) | ✅ Yes (per student) |
| Recent Quiz History | ✅ Yes (own) | ✅ Yes (per student) |

## API Endpoints Summary

### New Endpoint
- **GET** `/api/analytics/my-performance`
  - Authorization: ROLE_STUDENT
  - Returns: Current student's detailed analytics
  - Uses Spring Security Authentication to identify student

### Modified Endpoints
All existing analytics endpoints now have method-level authorization:
- Instructor-only endpoints require `@PreAuthorize("hasAuthority('ROLE_INSTRUCTOR')")`
- Student endpoint requires `@PreAuthorize("hasAuthority('ROLE_STUDENT')")`

## Testing Recommendations

### Student Testing
1. Log in as a student
2. Navigate to Performance Analytics
3. Verify only own data is displayed
4. Verify all charts render correctly
5. Verify strengths and weaknesses are identified
6. Try to access instructor endpoints (should fail)

### Instructor Testing
1. Log in as an instructor
2. Navigate to Performance Analytics
3. Verify all students are listed
4. Click "View Details" for multiple students
5. Verify data is correct for each student

### Security Testing
1. Test with invalid/expired tokens
2. Test student trying to access instructor endpoints
3. Test instructor trying to access student endpoint
4. Test accessing other students' data directly via URL

## Benefits

1. **Student Empowerment:** Students can track their own progress
2. **Self-Assessment:** Students identify their own strengths and weaknesses
3. **Motivation:** Visual progress tracking encourages improvement
4. **Privacy:** Students cannot see other students' data
5. **Transparency:** Clear visibility into performance metrics
6. **Actionable Insights:** Specific areas to improve are highlighted

## Future Enhancements

1. Add goal-setting feature for students
2. Add personalized recommendations based on weak topics
3. Add comparison with class average (anonymized)
4. Add achievement badges for milestones
5. Add study time tracking
6. Add progress notifications
7. Add export functionality (PDF report)
8. Add parent/guardian view (with permission)
