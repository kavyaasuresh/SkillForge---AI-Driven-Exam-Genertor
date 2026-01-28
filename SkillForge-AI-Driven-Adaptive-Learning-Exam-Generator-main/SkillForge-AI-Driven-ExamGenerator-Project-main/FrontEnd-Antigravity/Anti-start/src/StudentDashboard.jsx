import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Card,
    CardContent,
    Avatar,
    IconButton
} from '@mui/material';
import {
    School as SchoolIcon,
    Assignment as QuizIcon,
    TrendingUp as ProgressIcon,
    ArrowForward as ArrowForwardIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';

import { useAuth } from './context/AuthContext';
import { useStudent } from './context/StudentContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { studentData, refreshStudentData } = useStudent();
    const navigate = useNavigate();

    // Refresh data when component mounts
    useEffect(() => {
        refreshStudentData();
    }, []);

    const stats = [
        { label: 'Enrolled Courses', value: studentData.enrolledCourses.length, icon: <SchoolIcon />, color: '#6366f1' },
        { label: 'Quizzes Completed', value: studentData.stats.completedQuizzes, icon: <QuizIcon />, color: '#10b981' },
        { label: 'Average Score', value: `${studentData.stats.averageScore}%`, icon: <ProgressIcon />, color: '#a855f7' },
    ];

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box component="main">
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                            Welcome back, {user?.fullName || user?.username}! 👋
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>
                            Your learning journey is progressing beautifully. Keep it up!
                        </Typography>
                    </Box>
                    <IconButton sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', p: 1.5 }}>
                        <NotificationsIcon sx={{ color: '#64748b' }} />
                    </IconButton>
                </Box>

                {/* Statistics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '20px',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3
                            }}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: '16px',
                                    bgcolor: `${stat.color}15`,
                                    color: stat.color
                                }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* Enrolled Courses */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            Recently Accessed Courses
                        </Typography>
                        <Button
                            endIcon={<ArrowForwardIcon />}
                            sx={{ color: '#6366f1', textTransform: 'none', fontWeight: 600 }}
                            onClick={() => navigate('/student/courses')}
                        >
                            View All Courses
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {studentData.enrolledCourses.length > 0 ? (
                            studentData.enrolledCourses.map((course) => (
                                <Grid item xs={12} md={4} key={course.course_id}>
                                    <Card sx={{
                                        borderRadius: '20px',
                                        border: '1px solid #f1f5f9',
                                        aspectRatio: '1 / 1',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 20px -5px rgb(0 0 0 / 0.1)'
                                        }
                                    }}>
                                        <Box sx={{
                                            height: '100%',
                                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 3,
                                            textAlign: 'center',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <SchoolIcon sx={{
                                                color: 'white',
                                                fontSize: 100,
                                                opacity: 0.1,
                                                position: 'absolute',
                                                top: -20,
                                                right: -20
                                            }} />
                                            <Typography variant="h6" sx={{
                                                color: 'white',
                                                fontWeight: 800,
                                                mb: 3,
                                                position: 'relative',
                                                zIndex: 1,
                                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}>
                                                {course.title}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => navigate(`/student/course/${course.course_id}`)}
                                                sx={{
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    color: 'white',
                                                    px: 4,
                                                    '&:hover': {
                                                        bgcolor: 'white',
                                                        color: '#1e293b'
                                                    }
                                                }}
                                            >
                                                Resume Learning
                                            </Button>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px', border: '1px dashed #e2e8f0', bgcolor: 'transparent' }}>
                                    <Typography sx={{ color: '#64748b' }}>No courses enrolled yet. Start your journey today!</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Quick Quiz Shortcut */}
                <Paper sx={{
                    p: 4,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 3
                }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                            Ready for a Challenge? 🚀
                        </Typography>
                        <Typography sx={{ opacity: 0.8 }}>
                            You have 3 quizzes assigned to you. Test your knowledge and get adaptive feedback.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/student/quizzes')}
                        sx={{
                            bgcolor: 'white',
                            color: '#1e293b',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: '#f1f5f9'
                            }
                        }}
                    >
                        Go to Quizzes
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
};

export default StudentDashboard;
