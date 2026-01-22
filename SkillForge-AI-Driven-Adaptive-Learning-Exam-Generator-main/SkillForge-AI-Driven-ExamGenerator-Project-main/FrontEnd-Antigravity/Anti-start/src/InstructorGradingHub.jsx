import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent,
    Chip, Button, CircularProgress, Container, Stack, Avatar,
    IconButton, Divider, Breadcrumbs, Link
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Assessment as AssessmentIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    NavigateNext as NavigateNextIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizService } from './services/quizService';


const InstructorGradingHub = () => {
    const navigate = useNavigate();
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingReviews();
    }, []);

    const loadPendingReviews = async () => {
        setLoading(true);
        try {
            console.log("📊 [GRADES_HUB] Fetching pending manual reviews...");
            const data = await quizService.getPendingManualReviews();
            console.log("📊 [GRADES_HUB] Data received:", data);
            setPendingReviews(data || []);
        } catch (error) {
            console.error("Failed to load pending reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Container maxWidth="lg">
                    {/* Header & Breadcrumbs */}
                    <Box sx={{ mb: 4 }}>
                        <Breadcrumbs
                            separator={<NavigateNextIcon fontSize="small" />}
                            sx={{ mb: 2, color: '#64748b' }}
                        >
                            <Link
                                component="button"
                                underline="hover"
                                color="inherit"
                                onClick={() => navigate('/instructor/dashboard')}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
                            >
                                <HomeIcon fontSize="inherit" />
                                Dashboard
                            </Link>
                            <Link
                                component="button"
                                underline="hover"
                                color="inherit"
                                onClick={() => navigate('/instructor/quizzes')}
                                sx={{ fontWeight: 600 }}
                            >
                                Quiz Analytics
                            </Link>
                            <Typography color="text.primary" sx={{ fontWeight: 700 }}>Grading Hub</Typography>
                        </Breadcrumbs>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, letterSpacing: '-0.02em' }}>
                                    Grading Hub
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#64748b' }}>
                                    Manage and score student submissions that require manual evaluation.
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate(-1)}
                                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0', color: '#64748b' }}
                            >
                                Back
                            </Button>
                        </Box>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#6366f1' }} />
                        </Box>
                    ) : pendingReviews.length === 0 ? (
                        <Paper sx={{
                            p: 8,
                            textAlign: 'center',
                            borderRadius: '32px',
                            border: '1px dashed #cbd5e1',
                            bgcolor: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}>
                            <Box sx={{
                                display: 'inline-flex',
                                p: 3,
                                bgcolor: alpha('#10b981', 0.1),
                                borderRadius: '24px',
                                mb: 3
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="900" sx={{ mb: 1 }}>All Caught Up!</Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                                There are no pending manual reviews at the moment.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/instructor/quizzes')}
                                sx={{ borderRadius: '12px', fontWeight: 800, bgcolor: '#1e293b', px: 4, py: 1.2 }}
                            >
                                Return to Analytics
                            </Button>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {pendingReviews.map((review) => (
                                <Grid item xs={12} md={4} key={review.attemptId}>
                                    <Card sx={{
                                        borderRadius: '24px',
                                        border: '1px solid #f1f5f9',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'visible',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                            borderColor: alpha('#6366f1', 0.2)
                                        }
                                    }}>
                                        {/* Status Badge */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: -12,
                                            right: 20,
                                            zIndex: 2
                                        }}>
                                            <Chip
                                                label="Needs Grading"
                                                size="small"
                                                color="warning"
                                                sx={{ fontWeight: 800, px: 1, boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)' }}
                                            />
                                        </Box>

                                        <CardContent sx={{ p: 4 }}>
                                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                                <Avatar sx={{
                                                    bgcolor: alpha('#6366f1', 0.1),
                                                    color: '#6366f1',
                                                    fontWeight: 800,
                                                    width: 50,
                                                    height: 50,
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {review.studentName?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight="800" sx={{ color: '#1e293b', lineHeight: 1.2 }}>
                                                        {review.studentName}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {review.quizTitle}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                                            <Stack spacing={2} sx={{ mb: 4 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" color="textSecondary" fontWeight="600">Attempted on</Typography>
                                                    <Typography variant="body2" fontWeight="700" color="#1e293b">
                                                        {new Date(review.submittedAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" color="textSecondary" fontWeight="600">Auto-Evaluated Score</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b' }}>
                                                        {review.autoScore} / {review.totalMarks}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<EditIcon />}
                                                onClick={() => navigate(`/instructor/grading/${review.attemptId}`)}
                                                sx={{
                                                    borderRadius: '16px',
                                                    fontWeight: 800,
                                                    bgcolor: '#1e293b',
                                                    py: 1.5,
                                                    textTransform: 'none',
                                                    fontSize: '0.95rem',
                                                    '&:hover': { bgcolor: '#0f172a' }
                                                }}
                                            >
                                                Start Grading
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default InstructorGradingHub;
