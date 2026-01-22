import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Tabs,
    Tab,
    Paper,
    CircularProgress
} from '@mui/material';

import StudentQuizCard from './StudentQuizCard';
import { quizService } from './services/quizService';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStudent } from './context/StudentContext';

const QuizSection = () => {
    const { user } = useAuth();
    const { studentData, loading, refreshStudentData } = useStudent();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);

    const quizzes = studentData.quizzes || [];

    useEffect(() => {
        refreshStudentData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return quiz.status === 'ASSIGNED';
        if (tabValue === 2) return quiz.status === 'ATTEMPTED' || quiz.status === 'PENDING_MANUAL' || quiz.status === 'COMPLETED';
        if (tabValue === 3) return quiz.status === 'LOCKED';
        return true;
    });

    const handleRetake = async (quizId) => {
        try {
            await quizService.retakeQuiz(quizId);
            refreshStudentData(); // Refresh list to show quiz as ASSIGNED again
        } catch (error) {
            console.error("Failed to retake quiz:", error);
            alert("Failed to reset quiz. Please try again.");
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                        Your Quizzes ✍️
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Track your progress, challenge yourself, and master new topics.
                    </Typography>
                </Box>

                <Paper sx={{
                    mb: 4,
                    borderRadius: '16px',
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    overflow: 'hidden'
                }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            px: 2,
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#6366f1',
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: '#64748b',
                                py: 2,
                                '&.Mui-selected': {
                                    color: '#6366f1',
                                }
                            }
                        }}
                    >
                        <Tab label="All Quizzes" />
                        <Tab label="Assigned" />
                        <Tab label="Completed" />
                        <Tab label="Locked" />
                    </Tabs>
                </Paper>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#6366f1' }} />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {filteredQuizzes.length > 0 ? (
                            filteredQuizzes.map((quiz) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={quiz.quiz_id}>
                                    <StudentQuizCard
                                        quiz={quiz}
                                        onAttempt={() => navigate(`/student/quiz/${quiz.quiz_id}`)}
                                        onViewResult={() => navigate(`/student/quiz/${quiz.quiz_id}/result`)}
                                        onRetake={handleRetake}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Paper sx={{
                                    p: 8,
                                    textAlign: 'center',
                                    borderRadius: '24px',
                                    border: '1px dashed #e2e8f0',
                                    bgcolor: 'transparent'
                                }}>
                                    <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 600 }}>
                                        No quizzes found in this category.
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default QuizSection;
