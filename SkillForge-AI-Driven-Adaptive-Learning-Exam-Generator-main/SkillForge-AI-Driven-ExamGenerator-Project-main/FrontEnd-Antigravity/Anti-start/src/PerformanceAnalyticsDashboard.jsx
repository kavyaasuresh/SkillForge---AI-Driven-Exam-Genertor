import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    CircularProgress,
    Button,
    Card,
    CardContent
} from '@mui/material';
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    ComposedChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';

import analyticsService from './services/analyticsService';
import { TrendingUp, TrendingDown, School, Assessment, BarChart as BarChartIcon, Visibility } from '@mui/icons-material';

const PerformanceAnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Data states
    const [coursePerformance, setCoursePerformance] = useState([]);
    const [topicPerformance, setTopicPerformance] = useState([]);
    const [skillProgression, setSkillProgression] = useState([]);
    const [studentQuizScores, setStudentQuizScores] = useState([]);
    const [dailyInvolvement, setDailyInvolvement] = useState([]);
    const [overallCoursePerformance, setOverallCoursePerformance] = useState([]);
    const [courseStudentPerformance, setCourseStudentPerformance] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    // Filter states
    const [selectedCourse, setSelectedCourse] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [studentNameFilter, setStudentNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Table sorting
    const [orderBy, setOrderBy] = useState('percentage');
    const [order, setOrder] = useState('desc');

    // Color schemes for performance levels
    const COLORS = {
        strong: '#10b981',    // Green (>70%)
        average: '#f59e0b',   // Orange (40-70%)
        weak: '#ef4444'       // Red (<40%)
    };

    const DIFFICULTY_COLORS = {
        BEGINNER: '#3b82f6',
        INTERMEDIATE: '#8b5cf6',
        ADVANCED: '#ec4899'
    };

    useEffect(() => {
        fetchAllData();
        fetchAllStudents();
    }, []);
    
    useEffect(() => {
        if (selectedCourse) {
            fetchCourseStudentData(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchAllData = async () => {
        console.log('🚀 [Performance Dashboard] Starting data fetch...');
        setLoading(true);

        try {
            const [course, topic, skill, scores, daily, overall] = await Promise.all([
                analyticsService.getCoursePerformance(),
                analyticsService.getTopicPerformance(),
                analyticsService.getSkillProgression(),
                analyticsService.getStudentQuizScores(),
                analyticsService.getDailyStudentInvolvement(),
                analyticsService.getOverallCoursePerformance()
            ]);

            console.log('✅ [Performance Dashboard] All data fetched successfully');
            console.log('📊 Course Performance:', course);
            console.log('📊 Topic Performance:', topic);
            console.log('📊 Skill Progression:', skill);
            console.log('📊 Student Quiz Scores:', scores);
            console.log('📊 Daily Involvement:', daily);
            console.log('📊 Overall Course Performance:', overall);

            setCoursePerformance(course);
            setTopicPerformance(topic);
            setSkillProgression(skill);
            setStudentQuizScores(scores);
            setDailyInvolvement(daily);
            setOverallCoursePerformance(overall);
            
            // Extract unique course names
            const courses = [...new Set(overall.map(c => c.courseName))].filter(Boolean);
            setAvailableCourses(courses);
            if (courses.length > 0 && !selectedCourse) {
                setSelectedCourse(courses[0]);
            }
        } catch (error) {
            console.error('❌ [Performance Dashboard] Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchCourseStudentData = async (courseName) => {
        try {
            const data = await analyticsService.getStudentPerformanceByCourse(courseName);
            console.log('📊 Course Student Performance:', data);
            setCourseStudentPerformance(data);
        } catch (error) {
            console.error('❌ Error fetching course student data:', error);
            setCourseStudentPerformance([]);
        }
    };
    
    const fetchAllStudents = async () => {
        try {
            const data = await analyticsService.getAllStudents();
            console.log('📊 All Students:', data);
            setAllStudents(data);
        } catch (error) {
            console.error('❌ Error fetching all students:', error);
            setAllStudents([]);
        }
    };

    // Transform course performance data for pie chart
    const getCoursePerformancePieData = () => {
        console.log('🔄 [Performance Dashboard] Transforming course data for pie chart');

        const pieData = coursePerformance.flatMap(course => {
            if (!course?.students || !Array.isArray(course.students)) return [];
            return course.students.map(student => ({
                name: `${student.studentName} - ${course.courseName}`,
                value: student.percentage,
                studentId: student.studentId,
                courseName: course.courseName
            }));
        });

        console.log('📊 Pie chart data:', pieData);
        return pieData;
    };
    
    // Get student performance data for selected course
    const getSelectedCourseStudentData = () => {
        return courseStudentPerformance.map(student => ({
            name: student.studentName,
            value: Math.round(student.avgPercentage * 10) / 10
        }));
    };

    // Get color based on performance percentage
    const getPerformanceColor = (percentage) => {
        if (percentage > 70) return COLORS.strong;
        if (percentage >= 40) return COLORS.average;
        return COLORS.weak;
    };

    // Handle table sorting
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        console.log('🔄 [Performance Dashboard] Sorting by:', property, isAsc ? 'desc' : 'asc');
    };

    // Sort and filter student quiz scores
    const getFilteredAndSortedScores = () => {
        console.log('🔄 [Performance Dashboard] Filtering and sorting scores');
        console.log('📦 Active filters:', { selectedCourse, topicFilter, difficultyFilter, studentNameFilter, statusFilter });

        let filtered = [...studentQuizScores];

        // Apply filters
        if (studentNameFilter) {
            const searchTerm = studentNameFilter.toLowerCase();
            filtered = filtered.filter(score => 
                score.studentName && score.studentName.toLowerCase().includes(searchTerm)
            );
        }
        if (topicFilter) {
            filtered = filtered.filter(score => score.topicName === topicFilter);
        }
        if (difficultyFilter) {
            filtered = filtered.filter(score => score.difficulty === difficultyFilter);
        }
        if (statusFilter) {
            filtered = filtered.filter(score => score.status === statusFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (order === 'asc') {
                return aValue < bValue ? -1 : 1;
            }
            return aValue > bValue ? -1 : 1;
        });

        console.log('📊 Filtered and sorted data:', filtered);
        return filtered;
    };

    // Navigate to detailed student view
    const handleStudentClick = (studentId) => {
        console.log('🔗 [Performance Dashboard] Navigating to student details:', studentId);
        navigate(`/instructor/student/${studentId}/analytics`);
    };

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ p: 2, border: '1px solid #e5e7eb' }}>
                    <Typography variant="body2" fontWeight={600}>{label}</Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {entry.value}%
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex' }}>
                <Box sx={{ flexGrow: 1, p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', background: '#f5f7fb', minHeight: '100vh' }}>
            <Box sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                        📊 Performance Analytics
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Comprehensive student performance insights across courses, topics, and skill levels
                    </Typography>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid xs={12} md={4}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '16px'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>{coursePerformance.length}</Typography>
                                        <Typography variant="body2">Active Courses</Typography>
                                    </Box>
                                    <School sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={4}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            borderRadius: '16px'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>{topicPerformance.length}</Typography>
                                        <Typography variant="body2">Topics Covered</Typography>
                                    </Box>
                                    <Assessment sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={4}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            borderRadius: '16px'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>{studentQuizScores.length}</Typography>
                                        <Typography variant="body2">Total Attempts</Typography>
                                    </Box>
                                    <BarChartIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Course Selection and Student Performance Pie Chart */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    🎯 Course-wise Student Performance
                                </Typography>
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Select Course</InputLabel>
                                    <Select
                                        value={selectedCourse}
                                        label="Select Course"
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        {availableCourses.map(course => (
                                            <MenuItem key={course} value={course}>{course}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            {courseStudentPerformance.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={getSelectedCourseStudentData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getSelectedCourseStudentData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.value)} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        No data available for selected course
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Overall Course Performance Bar Chart */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                📊 Overall Course Performance
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={overallCoursePerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="courseName" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="avgPercentage" name="Average Score %" radius={[8, 8, 0, 0]}>
                                        {overallCoursePerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.avgPercentage)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Topic-wise Performance */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                📊 Topic-wise Average Scores
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topicPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="topicName" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="percentage" name="Average Score %" radius={[8, 8, 0, 0]}>
                                        {topicPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.percentage)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Daily Student Involvement */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                📅 Daily Student Involvement
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={dailyInvolvement}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis yAxisId="left" label={{ value: 'Students', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Attempts', angle: 90, position: 'insideRight' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="studentCount" name="Active Students" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="attemptCount"
                                        name="Total Attempts"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 6 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Student vs Quiz Scores Table */}
                <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                        📋 Student vs Quiz Scores
                    </Typography>

                    {/* Filters */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid xs={12} md={2.4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter by Student Name</InputLabel>
                                <Select
                                    value={studentNameFilter}
                                    label="Filter by Student Name"
                                    onChange={(e) => {
                                        setStudentNameFilter(e.target.value);
                                        console.log('🔄 [Performance Dashboard] Student filter changed:', e.target.value);
                                    }}
                                >
                                    <MenuItem value="">All Students</MenuItem>
                                    {[...new Set(studentQuizScores.map(s => s.studentName))].sort().map(name => (
                                        <MenuItem key={name} value={name}>{name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={2.4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter by Topic</InputLabel>
                                <Select
                                    value={topicFilter}
                                    label="Filter by Topic"
                                    onChange={(e) => {
                                        setTopicFilter(e.target.value);
                                        console.log('🔄 [Performance Dashboard] Topic filter changed:', e.target.value);
                                    }}
                                >
                                    <MenuItem value="">All Topics</MenuItem>
                                    {[...new Set(studentQuizScores.map(s => s.topicName))].sort().map(topic => (
                                        <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={2.4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter by Difficulty</InputLabel>
                                <Select
                                    value={difficultyFilter}
                                    label="Filter by Difficulty"
                                    onChange={(e) => {
                                        setDifficultyFilter(e.target.value);
                                        console.log('🔄 [Performance Dashboard] Difficulty filter changed:', e.target.value);
                                    }}
                                >
                                    <MenuItem value="">All Levels</MenuItem>
                                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                                    <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                                    <MenuItem value="ADVANCED">Advanced</MenuItem>
                                    <MenuItem value="EASY">Easy</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HARD">Hard</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={2.4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter by Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Filter by Status"
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        console.log('🔄 [Performance Dashboard] Status filter changed:', e.target.value);
                                    }}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="COMPLETED">Completed</MenuItem>
                                    <MenuItem value="PENDING_REVIEW">Pending Review</MenuItem>
                                    <MenuItem value="NOT_ATTEMPTED">Not Attempted</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={2.4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                    setStudentNameFilter('');
                                    setTopicFilter('');
                                    setDifficultyFilter('');
                                    setStatusFilter('');
                                    console.log('🔄 [Performance Dashboard] Filters cleared');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>

                    {/* Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'studentName'}
                                            direction={orderBy === 'studentName' ? order : 'asc'}
                                            onClick={() => handleSort('studentName')}
                                        >
                                            Student
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'quizTitle'}
                                            direction={orderBy === 'quizTitle' ? order : 'asc'}
                                            onClick={() => handleSort('quizTitle')}
                                        >
                                            Quiz
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Topic</TableCell>
                                    <TableCell>Difficulty</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'percentage'}
                                            direction={orderBy === 'percentage' ? order : 'asc'}
                                            onClick={() => handleSort('percentage')}
                                        >
                                            Score
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Submitted At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFilteredAndSortedScores().map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            '&:hover': { bgcolor: '#f8fafc' },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell fontWeight={600}>{row.studentName}</TableCell>
                                        <TableCell>{row.quizTitle}</TableCell>
                                        <TableCell>{row.topicName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.difficulty}
                                                size="small"
                                                sx={{
                                                    bgcolor: DIFFICULTY_COLORS[row.difficulty] || '#94a3b8',
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {row.status === 'NOT_ATTEMPTED' ? (
                                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                    --
                                                </Typography>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography
                                                        fontWeight={600}
                                                        sx={{ color: getPerformanceColor(row.percentage) }}
                                                    >
                                                        {row.score}/{row.totalMarks}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        ({Math.round(row.percentage)}%)
                                                    </Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status === 'NOT_ATTEMPTED' ? 'Not Attempted' : 
                                                       row.status === 'PENDING_REVIEW' ? 'Pending Review' : 'Completed'}
                                                size="small"
                                                color={row.status === 'COMPLETED' ? 'success' : 
                                                       row.status === 'PENDING_REVIEW' ? 'warning' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : '--'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {getFilteredAndSortedScores().length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No data available for the selected filters
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Student Analysis Section */}
                <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mt: 4 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                        👥 Student Analysis
                    </Typography>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allStudents.map((student) => (
                                    <TableRow
                                        key={student.studentId}
                                        sx={{
                                            '&:hover': { bgcolor: '#f8fafc' },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell fontWeight={600}>{student.name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<Visibility />}
                                                onClick={() => handleStudentClick(student.studentId)}
                                                sx={{
                                                    borderRadius: '8px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    bgcolor: '#6366f1',
                                                    '&:hover': { bgcolor: '#4f46e5' }
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {allStudents.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                No students found
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default PerformanceAnalyticsDashboard;
