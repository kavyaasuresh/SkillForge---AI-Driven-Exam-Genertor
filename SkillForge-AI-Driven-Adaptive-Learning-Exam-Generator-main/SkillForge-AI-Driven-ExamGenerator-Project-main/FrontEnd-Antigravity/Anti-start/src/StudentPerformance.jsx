import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';

import analyticsService from './services/analyticsService';
import { useAuth } from './context/AuthContext';
import {
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Schedule,
    School,
    Assessment
} from '@mui/icons-material';

const StudentPerformance = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);

    const COLORS = {
        strong: '#10b981',
        average: '#f59e0b',
        weak: '#ef4444',
        primary: '#6366f1',
        secondary: '#8b5cf6'
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        console.log('🚀 [Student Performance] Fetching data for current student');
        setLoading(true);

        try {
            // Call the student-specific endpoint that uses authentication
            const data = await analyticsService.getMyPerformance();
            console.log('✅ [Student Performance] Data received:', data);
            setStudentData(data);
        } catch (error) {
            console.error('❌ [Student Performance] Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceColor = (percentage) => {
        if (percentage > 70) return COLORS.strong;
        if (percentage >= 40) return COLORS.average;
        return COLORS.weak;
    };

    const getActivityData = () => {
        if (!studentData?.activityMetrics) return [];

        const { totalAssigned, totalAttempted } = studentData.activityMetrics;
        const notAttempted = totalAssigned - totalAttempted;

        return [
            { name: 'Attempted', value: totalAttempted, color: COLORS.strong },
            { name: 'Not Attempted', value: notAttempted, color: COLORS.weak }
        ];
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!studentData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Typography>No performance data available</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', background: '#f5f7fb', minHeight: '100vh' }}>
            <Box sx={{ flexGrow: 1, p: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                        📊 My Performance Analytics
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Track your progress and identify areas for improvement
                    </Typography>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid xs={12} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '16px'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>
                                            {studentData.activityMetrics.totalAssigned}
                                        </Typography>
                                        <Typography variant="body2">Total Assigned</Typography>
                                    </Box>
                                    <Assessment sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            borderRadius: '16px'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>
                                            {studentData.activityMetrics.totalAttempted}
                                        </Typography>
                                        <Typography variant="body2">Attempted</Typography>
                                    </Box>
                                    <CheckCircle sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            borderRadius: '16px'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>
                                            {studentData.activityMetrics.completionRate}%
                                        </Typography>
                                        <Typography variant="body2">Completion Rate</Typography>
                                    </Box>
                                    <TrendingUp sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={12} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: 'white',
                            borderRadius: '16px'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight={700}>
                                            {studentData.coursePerformance.length}
                                        </Typography>
                                        <Typography variant="body2">Active Courses</Typography>
                                    </Box>
                                    <School sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Course Performance Bar Chart */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                📚 Course-wise Performance
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={studentData.coursePerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="courseName" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="percentage" name="Score %" radius={[8, 8, 0, 0]}>
                                        {studentData.coursePerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.percentage)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Activity Metrics Pie Chart */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                📊 Activity Overview
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={getActivityData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {getActivityData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Radar Chart - Topic Strengths/Weaknesses */}
                    <Grid xs={12}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                🎯 Topic-wise Skill Profile
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={studentData.topicPerformance}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="topicName" tick={{ fontSize: 12 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar
                                        name="Performance %"
                                        dataKey="percentage"
                                        stroke={COLORS.primary}
                                        fill={COLORS.primary}
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>

                            {/* Strengths and Weaknesses */}
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid xs={12} md={6}>
                                    <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: COLORS.strong }}>
                                            🟢 Strong Topics (&gt;70%)
                                        </Typography>
                                        {studentData.topicPerformance
                                            .filter(t => t.percentage > 70)
                                            .map(topic => (
                                                <Chip
                                                    key={topic.topicId}
                                                    label={`${topic.topicName} (${topic.percentage}%)`}
                                                    sx={{ m: 0.5, bgcolor: COLORS.strong, color: 'white' }}
                                                    size="small"
                                                />
                                            ))}
                                        {studentData.topicPerformance.filter(t => t.percentage > 70).length === 0 && (
                                            <Typography variant="body2" color="text.secondary">Keep practicing to build strengths!</Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid xs={12} md={6}>
                                    <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: '12px', border: '2px solid #ef4444' }}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: COLORS.weak }}>
                                            🔴 Areas to Improve (&lt;40%)
                                        </Typography>
                                        {studentData.topicPerformance
                                            .filter(t => t.percentage < 40)
                                            .map(topic => (
                                                <Chip
                                                    key={topic.topicId}
                                                    label={`${topic.topicName} (${topic.percentage}%)`}
                                                    sx={{ m: 0.5, bgcolor: COLORS.weak, color: 'white' }}
                                                    size="small"
                                                />
                                            ))}
                                        {studentData.topicPerformance.filter(t => t.percentage < 40).length === 0 && (
                                            <Typography variant="body2" color="text.secondary">Great job! No weak areas.</Typography>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Score Distribution Histogram */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                📊 Score Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { range: '0-20%', count: studentData.recentAttempts.filter(a => a.score < 20).length },
                                    { range: '20-40%', count: studentData.recentAttempts.filter(a => a.score >= 20 && a.score < 40).length },
                                    { range: '40-60%', count: studentData.recentAttempts.filter(a => a.score >= 40 && a.score < 60).length },
                                    { range: '60-80%', count: studentData.recentAttempts.filter(a => a.score >= 60 && a.score < 80).length },
                                    { range: '80-100%', count: studentData.recentAttempts.filter(a => a.score >= 80).length }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" name="Number of Quizzes" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Performance Trend */}
                    <Grid xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                📈 Performance Trend
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={studentData.recentAttempts.slice().reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        name="Score %"
                                        stroke={COLORS.primary}
                                        strokeWidth={3}
                                        dot={{ fill: COLORS.primary, r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Performance Summary */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#f0fdf4' }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: COLORS.strong }}>
                                🎯 Max Score
                            </Typography>
                            <Typography variant="h3" fontWeight={700} color={COLORS.strong}>
                                {studentData.recentAttempts.length > 0
                                    ? Math.max(...studentData.recentAttempts.map(a => a.score))
                                    : 0}%
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#fef2f2' }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: COLORS.weak }}>
                                📉 Min Score
                            </Typography>
                            <Typography variant="h3" fontWeight={700} color={COLORS.weak}>
                                {studentData.recentAttempts.length > 0
                                    ? Math.min(...studentData.recentAttempts.map(a => a.score))
                                    : 0}%
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', bgcolor: '#eff6ff' }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: COLORS.primary }}>
                                📊 Average Score
                            </Typography>
                            <Typography variant="h3" fontWeight={700} color={COLORS.primary}>
                                {studentData.recentAttempts.length > 0
                                    ? (studentData.recentAttempts.reduce((sum, a) => sum + a.score, 0) / studentData.recentAttempts.length).toFixed(1)
                                    : 0}%
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Quiz History */}
                <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                        📝 Recent Quiz History
                    </Typography>
                    <List>
                        {studentData.recentAttempts.map((attempt, index) => (
                            <React.Fragment key={attempt.quizId}>
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {attempt.quizTitle}
                                                </Typography>
                                                <Chip
                                                    label={attempt.status}
                                                    color={attempt.status === 'COMPLETED' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    sx={{ color: getPerformanceColor(attempt.score) }}
                                                >
                                                    Score: {attempt.score}%
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(attempt.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < studentData.recentAttempts.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Box>
    );
};

export default StudentPerformance;
