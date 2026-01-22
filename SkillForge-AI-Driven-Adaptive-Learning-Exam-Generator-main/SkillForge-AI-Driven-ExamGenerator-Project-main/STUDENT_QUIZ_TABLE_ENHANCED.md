# ✅ Student vs Quiz Scores Table - Enhanced

## 🎯 Changes Made

### 1. ✅ Removed "View Details" Button
- Cleaner table interface
- Removed unnecessary action column
- Focus on data display

### 2. ✅ Added "NOT_ATTEMPTED" Status
- Shows all assigned quizzes (attempted + not attempted)
- Three status types:
  - **Completed** (Green) - Quiz submitted and graded
  - **Pending Review** (Orange) - Submitted but needs manual grading
  - **Not Attempted** (Gray) - Assigned but not yet taken

### 3. ✅ Added "Submitted At" Column
- Shows submission date and time
- Format: "Jan 15, 2024, 10:30 AM"
- Shows "--" for not attempted quizzes

### 4. ✅ Added Status Filter
- New dropdown to filter by status
- Options: All Status, Completed, Pending Review, Not Attempted
- Works with other filters

### 5. ✅ Enhanced Score Display
- Shows "--" for not attempted quizzes
- Shows "X/Y (Z%)" for attempted quizzes
- Color-coded by performance level

---

## 📊 Table Columns (Final)

| Column | Description | Sortable | Features |
|--------|-------------|----------|----------|
| **Student** | Student name | ✅ Yes | From user_authentication table |
| **Quiz** | Quiz title | ✅ Yes | Quiz name |
| **Topic** | Topic/Course name | ❌ No | Real topic from database |
| **Difficulty** | Quiz difficulty | ❌ No | Color-coded chip |
| **Score** | Score/Total (%) | ✅ Yes | Color-coded, "--" if not attempted |
| **Status** | Attempt status | ❌ No | Color-coded chip |
| **Submitted At** | Submission date/time | ❌ No | Formatted date, "--" if not attempted |

---

## 🎨 Status Display

### Completed (Green Chip)
- Quiz submitted and fully graded
- Shows actual score
- Shows submission date

### Pending Review (Orange Chip)
- Quiz submitted but needs manual grading
- Shows auto-graded score
- Shows submission date

### Not Attempted (Gray Chip)
- Quiz assigned but not taken
- Shows "--" for score
- Shows "--" for date

---

## 🔍 Filters Available

1. **Student Name** - Dropdown with all student names
2. **Topic** - Dropdown with all topics
3. **Difficulty** - Dropdown with all difficulty levels
4. **Status** - NEW! Dropdown with:
   - All Status
   - Completed
   - Pending Review
   - Not Attempted
5. **Clear Filters** - Reset all filters

---

## 🗄️ Backend Changes

### Updated Query:
```sql
SELECT 
    s.id,                                              -- Student ID
    u.name,                                            -- Student name
    q.quizId,                                          -- Quiz ID
    q.title,                                           -- Quiz title
    COALESCE(t.name, q.topic, 'General Knowledge'),   -- Topic name
    q.difficulty,                                      -- Difficulty
    COALESCE(a.score, 0),                             -- Score (0 if not attempted)
    q.totalMarks,                                      -- Total marks
    a.submittedAt,                                     -- Submission date (null if not attempted)
    CASE 
        WHEN a.attemptId IS NULL THEN 'NOT_ATTEMPTED'
        WHEN a.status = 'PENDING_MANUAL_EVALUATION' THEN 'PENDING_REVIEW'
        ELSE 'COMPLETED'
    END                                                -- Status
FROM StudentQuizAssignment sa                          -- Start from assignments
JOIN sa.student s
JOIN s.user u
JOIN sa.quiz q
LEFT JOIN Topic t ON t.id = q.topicId
LEFT JOIN StudentQuizAttempt a ON a.assignment.id = sa.id AND a.submittedAt IS NOT NULL
```

**Key Changes:**
- Changed FROM clause to start from `StudentQuizAssignment` (not `StudentQuizAttempt`)
- LEFT JOIN with `StudentQuizAttempt` to include not attempted
- CASE statement for status determination
- COALESCE for score (0 if null)

---

## 💡 UI Enhancements

### Score Column:
```jsx
{row.status === 'NOT_ATTEMPTED' ? (
    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
        --
    </Typography>
) : (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography fontWeight={600} sx={{ color: getPerformanceColor(row.percentage) }}>
            {row.score}/{row.totalMarks}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
            ({Math.round(row.percentage)}%)
        </Typography>
    </Box>
)}
```

### Status Column:
```jsx
<Chip
    label={row.status === 'NOT_ATTEMPTED' ? 'Not Attempted' : 
           row.status === 'PENDING_REVIEW' ? 'Pending Review' : 'Completed'}
    size="small"
    color={row.status === 'COMPLETED' ? 'success' : 
           row.status === 'PENDING_REVIEW' ? 'warning' : 'default'}
/>
```

### Submitted At Column:
```jsx
<Typography variant="body2" sx={{ color: '#64748b' }}>
    {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '--'}
</Typography>
```

---

## 🧪 Testing Steps

### 1. Restart Backend
```bash
cd BackEnd/SkillForge_1
./mvnw clean spring-boot:run
```

### 2. Test Data Scenarios

**Scenario 1: Student with completed quiz**
- Should show: Score, percentage, "Completed" status, submission date

**Scenario 2: Student with pending review**
- Should show: Auto score, "Pending Review" status, submission date

**Scenario 3: Student assigned but not attempted**
- Should show: "--" for score, "Not Attempted" status, "--" for date

### 3. Test Filters
1. Filter by Status = "Not Attempted"
   - Should show only unfinished assignments
2. Filter by Status = "Completed"
   - Should show only finished quizzes
3. Filter by Status = "Pending Review"
   - Should show only quizzes needing grading
4. Combine filters (e.g., Student + Status)
   - Should work together

### 4. Test Sorting
- Sort by Student Name (A-Z, Z-A)
- Sort by Quiz Title (A-Z, Z-A)
- Sort by Score (High-Low, Low-High)
- Not attempted should sort as 0%

---

## ✅ Success Criteria

Table is working correctly when:

1. ✅ Shows all assigned quizzes (attempted + not attempted)
2. ✅ "Not Attempted" status displays correctly
3. ✅ Score shows "--" for not attempted
4. ✅ Submitted date shows "--" for not attempted
5. ✅ Status filter works (all 3 options)
6. ✅ All other filters still work
7. ✅ No "View Details" button
8. ✅ Submitted At column displays dates
9. ✅ Color coding works for all statuses
10. ✅ Sorting works correctly

---

## 📋 Files Modified

### Backend (2 files):
1. `AnalyticsRepository.java` - Updated getStudentQuizScores query
2. `AnalyticsService.java` - Updated to handle status from query

### Frontend (1 file):
1. `PerformanceAnalyticsDashboard.jsx` - Enhanced table with new column and filter

---

## 🎨 Color Scheme

### Status Colors:
- **Completed**: Green (#10b981)
- **Pending Review**: Orange (#f59e0b)
- **Not Attempted**: Gray (#94a3b8)

### Score Colors:
- **Strong (>70%)**: Green (#10b981)
- **Average (40-70%)**: Orange (#f59e0b)
- **Weak (<40%)**: Red (#ef4444)
- **Not Attempted**: Gray (#94a3b8)

---

**Status:** ✅ COMPLETE - TABLE ENHANCED
**Date:** 2024
**Implemented By:** Amazon Q Developer
