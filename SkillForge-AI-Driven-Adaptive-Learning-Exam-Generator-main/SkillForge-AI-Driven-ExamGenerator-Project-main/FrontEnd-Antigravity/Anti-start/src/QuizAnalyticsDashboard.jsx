import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, CardActionArea,
    Chip, IconButton, CircularProgress, Container, Stack, Avatar,
    LinearProgress, Tooltip, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Divider, List, ListItem, ListItemText,
    TextField, MenuItem, InputAdornment
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Quiz as QuizIcon,
    People as PeopleIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    TrendingUp as TrendingUpIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Assessment as AssessmentIcon,
    ArrowBack as ArrowBackIcon,
    MenuBook as CoursesIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService } from './services/quizService';
import { courseService } from './services/courseService';
import { useAuth } from './context/AuthContext';


const QuizAnalyticsDashboard = () => {
    const navigate = useNavigate();
    const { courseId, topicId } = useParams();

    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizDetails, setQuizDetails] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Manual Grading State
    const [pendingReviews, setPendingReviews] = useState([]);
    const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
    const [selectedAttemptReview, setSelectedAttemptReview] = useState(null);
    const [submittingGrades, setSubmittingGrades] = useState(false);
    const [itemGrades, setItemGrades] = useState({}); // responseId -> marks
    const [gradingHubActive, setGradingHubActive] = useState(false);

    // Topic filtering state
    const [topicMap, setTopicMap] = useState(new Map()); // id -> name
    const [topicToCourseMap, setTopicToCourseMap] = useState(new Map()); // topicId -> courseId
    const [filterTopicId, setFilterTopicId] = useState('ALL');
    const [availableTopics, setAvailableTopics] = useState([]); // List of {id, name} for dropdown

    useEffect(() => {
        loadDashboardData();
        if (availableTopics.length === 0) {
            loadTopics();
        }
    }, [topicId, filterTopicId]);

    const loadDashboardData = async () => {
        setLoading(true);
        await Promise.all([
            loadQuizzes(),
            loadPendingReviews()
        ]);
        setLoading(false);
    };

    const loadPendingReviews = async () => {
        try {
            const data = await quizService.getPendingManualReviews();
            console.log("📊 [GRADES_DEBUG] Pending reviews fetched:", data?.length || 0, data);
            setPendingReviews(data || []);
        } catch (error) {
            console.error("Failed to load pending reviews:", error);
        }
    };

    const loadTopics = async () => {
        try {
            const courses = await courseService.getCourses();
            const map = new Map();
            const topicCourseMap = new Map();
            const topicList = [];

            courses.forEach(course => {
                const cId = course.course_id || course.courseId;
                if (course.topics) {
                    course.topics.forEach(topic => {
                        // Handle potential ID inconsistencies (database id vs index)
                        const tId = topic.topicId || topic.id;
                        if (tId) {
                            map.set(Number(tId), topic.title || topic.name);
                            topicCourseMap.set(Number(tId), cId); // Map topicId to courseId
                            topicList.push({ id: Number(tId), name: topic.title || topic.name, courseName: course.title || course.course_title, courseId: cId });
                        }
                    });
                }
            });
            setTopicMap(map);
            setTopicToCourseMap(topicCourseMap);
            setAvailableTopics(topicList);
        } catch (error) {
            console.error("Failed to load topics:", error);
        }
    };

    const loadQuizzes = async () => {
        console.log("\n📊 ========== LOADING QUIZZES FOR ANALYTICS ==========");
        console.log("🔍 Course ID:", courseId);
        console.log("🔍 Topic ID:", topicId);

        setLoading(true);
        try {
            console.log("📞 1. Calling quizService.getAllQuizzes()...");
            const allQuizzes = await quizService.getAllQuizzes();

            console.log("✅ Received base quizzes:", allQuizzes?.length || 0);

            // Filter by topic if topicId is provided in URL
            // OR if user selected a filter in dropdown
            let filtered = allQuizzes;

            // 1. URL Param Filter (Hard filter)
            if (topicId) {
                filtered = filtered.filter(q => q.topicId === Number(topicId));
            }

            // 2. Dropdown Filter (Soft filter, only applies if no URL param)
            else if (filterTopicId !== 'ALL') {
                filtered = filtered.filter(q => q.topicId === Number(filterTopicId));
            }

            console.log("🔍 2. Filtered Quizzes:", filtered.length);

            // HYDRATION STEP: Fetch analytics for each quiz
            if (filtered.length > 0) {
                console.log("🔄 3. Hydrating quizzes with detailed analytics...");

                // Use Promise.all to fetch details in parallel
                const detailedQuizzes = await Promise.all(filtered.map(async (quiz) => {
                    try {
                        const qId = quiz.quizId || quiz.id;
                        console.log(`   > Fetching detail for Quiz ID: ${qId}`);

                        // Fetch detailed analytics (which includes assignments & attempts)
                        // If this fails, we fall back to the basic quiz object
                        const analyticsData = await quizService.getQuizAnalytics(qId);

                        // Merge the data. 
                        // Priority: Analytics Data > Basic Quiz Data
                        return {
                            ...quiz,
                            ...analyticsData,
                            // Ensure arrays exist
                            assignedStudents: analyticsData.assignedStudents || quiz.assignedStudents || [],
                            attempts: analyticsData.attempts || quiz.attempts || []
                        };
                    } catch (err) {
                        console.warn(`   ⚠️ Failed to hydrate Quiz ID ${quiz.quizId || quiz.id}:`, err.message);
                        return quiz; // Return basic quiz on failure
                    }
                }));

                filtered = detailedQuizzes;
                console.log("✅ 4. Hydration complete. Sample quiz attempts status:", filtered[0]?.attempts?.map(a => a.evaluationStatus));
            }

            setQuizzes(filtered);
            console.log("✅ ========== QUIZZES LOADED & HYDRATED SUCCESSFULLY ==========\n");
        } catch (error) {
            console.error("❌ ========== FAILED TO LOAD QUIZZES ==========");
            console.error("Error:", error);
            console.log("❌ ========== LOAD ERROR END ==========\n");
        } finally {
            // setLoading(false); // Handled by loadDashboardData
        }
    };

    const handleOpenGrading = async (attemptId) => {
        try {
            setLoadingDetails(true);
            const reviewData = await quizService.getAttemptReview(attemptId);
            setSelectedAttemptReview(reviewData);

            // Initialize grades from existing marks if any
            const initialGrades = {};
            if (reviewData.questions) {
                reviewData.questions.forEach(q => {
                    initialGrades[q.responseId] = q.marksObtained || 0;
                });
            }
            setItemGrades(initialGrades);
            setGradingDialogOpen(true);
        } catch (error) {
            console.error("Failed to load attempt review:", error);
            alert("Error loading grading data.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSubmitGrades = async () => {
        if (!selectedAttemptReview) return;

        setSubmittingGrades(true);
        try {
            const payload = {
                responses: Object.entries(itemGrades).map(([id, marks]) => ({
                    responseId: Number(id),
                    marks: Number(marks)
                }))
            };

            await quizService.submitAttemptGrades(selectedAttemptReview.attemptId, payload);
            alert("Grades submitted successfully!");
            setGradingDialogOpen(false);

            // Refresh data
            loadDashboardData();
        } catch (error) {
            console.error("Failed to submit grades:", error);
            alert("Error submitting grades. Please try again.");
        } finally {
            setSubmittingGrades(false);
        }
    };

    const handleViewDetails = async (quiz) => {
        setSelectedQuiz(quiz);
        setDetailsDialogOpen(true);
        setLoadingDetails(true);

        try {
            const details = await quizService.getQuizAnalytics(quiz.quizId || quiz.id);
            setQuizDetails(details);
        } catch (error) {
            console.error("Failed to load quiz details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleEditQuiz = (quiz) => {
        // Use the route that InstructorQuizManager is listening on
        // Route assumed: /instructor/course/:courseId/topic/:topicId/quiz/edit/:quizId
        const qId = quiz.quizId || quiz.id;
        const tId = topicId || quiz.topicId;

        // If courseId from URL params is undefined, try to find it from quiz data or topic mapping
        let cId = courseId;
        if (!cId) {
            // Try to find courseId from quiz data first
            cId = quiz.courseId;

            // If still not found, try to look up from topicToCourseMap
            if (!cId && tId && topicToCourseMap.has(Number(tId))) {
                cId = topicToCourseMap.get(Number(tId));
            }

            // Fallback to 'default' if nothing found
            if (!cId) {
                cId = 'default';
            }
        }

        navigate(`/instructor/course/${cId}/topic/${tId}/quiz/edit/${qId}`);
    };

    const handleDeleteQuiz = async (quizId) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;

        try {
            await quizService.deleteQuiz(quizId);
            setQuizzes(prev => prev.filter(q => (q.quizId !== quizId && q.id !== quizId)));
        } catch (error) {
            console.error("Failed to delete quiz:", error);
        }
    };

    const calculateStats = (quiz) => {
        const attempts = quiz.attempts || [];
        const totalAssigned = quiz.assignedStudents?.length || 0;
        const attempted = attempts.length || 0;
        const avgScore = attempts.length > 0
            ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(1)
            : '0';
        const completionRate = totalAssigned > 0 ? ((attempted / totalAssigned) * 100).toFixed(0) : '0';

        // Count attempts that need manual grading
        const pendingManual = attempts.filter(a => a.evaluationStatus === 'PENDING_MANUAL').length || 0;

        return { totalAssigned, attempted, avgScore, completionRate, pendingManual };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Loading Quiz Analytics...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Container maxWidth="xl">
                    {/* Header with Filter */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, gap: 3, mb: 5 }}>
                        <Box display="flex" alignItems="center" gap={3}>
                            <IconButton
                                onClick={() => navigate(-1)}
                                sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:hover': { bgcolor: '#f1f5f9' } }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5, background: 'linear-gradient(45deg, #1e293b, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Quiz Analytics Dashboard
                                    <Chip label="v1.1-fixed" size="small" variant="outlined" sx={{ ml: 2, height: 20, fontSize: '0.6rem', color: '#6366f1', borderColor: '#6366f1' }} />
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                                    {topicId ? `Topic: ${topicMap.get(Number(topicId)) || 'Specific Topic'}` : 'Overview & Performance'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box display="flex" gap={2} flexWrap="wrap">
                            {/* Topic Filter Dropdown (Only show if not already drilled down by URL) */}
                            {!topicId && (
                                <TextField
                                    select
                                    size="small"
                                    value={filterTopicId}
                                    onChange={(e) => {
                                        setFilterTopicId(e.target.value);
                                        // Trigger reload or just local filter?
                                        // For simplicity and hydration, let's just trigger a re-render/re-filter logic.
                                        // Ideally we should move filtering to render time or effect dependency, 
                                        // but since loadQuizzes handles hydration on ALL quizzes first, we can just re-run loadQuizzes 
                                        // OR better: we can filter in the RENDER function?
                                        // Actually loadQuizzes sets 'quizzes' state. To avoid re-fetching, we should probably 
                                        // keep 'allQuizzes' in state and filter locally. 
                                        // BUT, for now, let's keep it simple: Changing filter triggers re-load to ensure hydration is correct for the subset.
                                        // Wait, reloading from API just to filter is inefficient. 
                                        // Optimization: Since we fetched ALL, let's just use local filtering? 
                                        // Ah, the code structure in loadQuizzes does hydration on 'filtered'. So we MUST re-run loadQuizzes 
                                        // to hydrate the newly selected subset.
                                    }}
                                    variant="outlined"
                                    sx={{
                                        minWidth: 200,
                                        bgcolor: 'white',
                                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FilterListIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                >
                                    <MenuItem value="ALL">All Topics</MenuItem>
                                    {/* Show only topics that actually have quizzes? Or all available? 
                                        Let's show all available topics that we found. */}
                                    {availableTopics.map((topic) => (
                                        <MenuItem key={topic.id} value={topic.id}>
                                            {topic.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}

                            {courseId && topicId ? (
                                <Button
                                    variant="contained"
                                    startIcon={<QuizIcon />}
                                    onClick={() => navigate(`/instructor/course/${courseId}/topic/${topicId}/quiz/create`)}
                                    sx={{
                                        px: 3, py: 1, borderRadius: '12px', fontWeight: 800,
                                        bgcolor: '#1e293b', boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
                                        '&:hover': { bgcolor: '#0f172a', transform: 'translateY(-2px)' },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Create Quiz
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    startIcon={<CoursesIcon />}
                                    onClick={() => navigate('/instructor/courses')}
                                    sx={{
                                        px: 3, py: 1, borderRadius: '12px', fontWeight: 800,
                                        borderWidth: 2, borderColor: '#e2e8f0', color: '#64748b',
                                        '&:hover': { borderWidth: 2, borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                                    }}
                                >
                                    Browse Courses
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

                        {/* Grading Hub Section Removed - Moved to dedicated page */}

                        {/* Compact Grading Overview on Dashboard */}
                        <Box sx={{ mb: 6 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <Box sx={{ p: 1, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', borderRadius: '10px', display: 'flex' }}>
                                        <AssessmentIcon fontSize="small" />
                                    </Box>
                                    <Typography variant="h6" fontWeight="800" color="#1e293b">Requires Grading</Typography>
                                </Box>
                                <Button
                                    size="small"
                                    onClick={() => navigate('/instructor/grading-hub')}
                                    sx={{ fontWeight: 700, textTransform: 'none', color: '#6366f1' }}
                                    endIcon={<NavigateNextIcon fontSize="small" />}
                                >
                                    Go to Grading Hub
                                </Button>
                            </Box>

                            {pendingReviews.length === 0 ? (
                                <Paper sx={{
                                    p: 4,
                                    borderRadius: '20px',
                                    border: '1px dashed #e2e8f0',
                                    bgcolor: 'white',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="body2" color="textSecondary" fontWeight="600">
                                        No pending manual reviews. Great job!
                                    </Typography>
                                </Paper>
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    overflowX: 'auto',
                                    pb: 2,
                                    pt: 0.5,
                                    px: 0.5,
                                    '&::-webkit-scrollbar': { height: 6 },
                                    '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 3 }
                                }}>
                                    {pendingReviews.slice(0, 5).map((review) => (
                                        <Card key={review.attemptId} sx={{
                                            minWidth: 280,
                                            borderRadius: '16px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: 'none',
                                            bgcolor: 'white',
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-2px)', borderColor: alpha('#f59e0b', 0.5) }
                                        }}>
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 800 }}>
                                                            {review.quizTitle}
                                                        </Typography>
                                                        <Typography variant="subtitle2" fontWeight="800" sx={{ mt: 0.2 }}>
                                                            {review.studentName}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/instructor/grading/${review.attemptId}`)}
                                                        sx={{ bgcolor: '#f8fafc', color: '#1e293b' }}
                                                    >
                                                        <EditIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="caption" color="textSecondary" fontWeight="600">
                                                        Auto: {review.autoScore}/{review.totalMarks}
                                                    </Typography>
                                                    <Chip label="Grade Now" size="mini" sx={{ fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }} />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {pendingReviews.length > 5 && (
                                        <Box
                                            onClick={() => navigate('/instructor/grading-hub')}
                                            sx={{
                                                minWidth: 100,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                bgcolor: alpha('#6366f1', 0.03),
                                                borderRadius: '16px',
                                                border: '1px dashed #cbd5e1',
                                                '&:hover': { bgcolor: alpha('#6366f1', 0.06) }
                                            }}
                                        >
                                            <Typography variant="h6" fontWeight="900" color="#6366f1">+{pendingReviews.length - 5}</Typography>
                                            <Typography variant="caption" fontWeight="700" color="textSecondary">More</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* Summary Cards */}
                        <Grid container spacing={2.5} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <Card sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box sx={{ p: 1.5, bgcolor: alpha('#6366f1', 0.1), borderRadius: '12px' }}>
                                                <QuizIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight="900" sx={{ lineHeight: 1 }}>{quizzes.length}</Typography>
                                                <Typography variant="caption" color="textSecondary" fontWeight="700">Total Quizzes</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <Card sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box sx={{ p: 1.5, bgcolor: alpha('#10b981', 0.1), borderRadius: '12px' }}>
                                                <PeopleIcon sx={{ fontSize: 24, color: '#10b981' }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight="900" sx={{ lineHeight: 1 }}>
                                                    {quizzes.reduce((sum, q) => sum + (q.assignedStudents?.length || 0), 0)}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" fontWeight="700">Total Assigned</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <Card sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box sx={{ p: 1.5, bgcolor: alpha('#f59e0b', 0.1), borderRadius: '12px' }}>
                                                <CheckCircleIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight="900" sx={{ lineHeight: 1 }}>
                                                    {quizzes.reduce((sum, q) => sum + (q.attempts?.length || 0), 0)}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" fontWeight="700">Total Attempts</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <Card
                                    onClick={() => navigate('/instructor/grading-hub')}
                                    sx={{
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: pendingReviews.length > 0 ? alpha('#f59e0b', 0.5) : '#f1f5f9',
                                        background: pendingReviews.length > 0 ? alpha('#fff7ed', 0.5) : 'white',
                                        boxShadow: pendingReviews.length > 0 ? '0 4px 12px rgba(245, 158, 11, 0.1)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: '#f59e0b',
                                            bgcolor: alpha('#fff7ed', 0.3)
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box sx={{ p: 1.5, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', borderRadius: '12px' }}>
                                                <AssessmentIcon sx={{ fontSize: 24 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight="900" sx={{ lineHeight: 1, color: pendingReviews.length > 0 ? '#d97706' : 'inherit' }}>
                                                    {pendingReviews.length}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" fontWeight="700">Pending Reviews</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                                <Card sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: 'white' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box sx={{ p: 1.5, bgcolor: alpha('#8b5cf6', 0.1), borderRadius: '12px' }}>
                                                <TrendingUpIcon sx={{ fontSize: 24, color: '#8b5cf6' }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight="900" sx={{ lineHeight: 1 }}>
                                                    {quizzes.length > 0
                                                        ? (quizzes.reduce((sum, q) => {
                                                            const attempts = q.attempts || [];
                                                            return sum + (attempts.length > 0 ? attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length : 0);
                                                        }, 0) / quizzes.length).toFixed(1)
                                                        : 0
                                                    }%
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" fontWeight="700">Avg Score</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Quiz Cards */}
                        {quizzes.length === 0 ? (
                            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <QuizIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
                                <Typography variant="h6" fontWeight="800" color="textSecondary" gutterBottom>
                                    No Quizzes Found
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                    {courseId && topicId
                                        ? 'Create your first quiz to start tracking student performance'
                                        : 'Select a course and topic to create a quiz'}
                                </Typography>

                                {courseId && topicId ? (
                                    <Button
                                        variant="contained"
                                        startIcon={<QuizIcon />}
                                        onClick={() => navigate(`/instructor/course/${courseId}/topic/${topicId}/quiz/create`)}
                                        sx={{ borderRadius: '16px', fontWeight: 700 }}
                                    >
                                        Create Quiz
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        startIcon={<CoursesIcon />}
                                        onClick={() => navigate('/instructor/courses')}
                                        sx={{ borderRadius: '16px', fontWeight: 700 }}
                                    >
                                        Browse Courses
                                    </Button>
                                )}
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {quizzes.map((quiz) => {
                                    const stats = calculateStats(quiz);
                                    return (
                                        <Grid item xs={12} md={6} lg={4} key={quiz.quizId || quiz.id}>
                                            <Card sx={{
                                                borderRadius: '24px',
                                                border: '1px solid #f1f5f9',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                                                }
                                            }}>
                                                <CardContent sx={{ p: 3 }}>
                                                    {/* Header */}
                                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                                        <Box display="flex" alignItems="center" gap={1.5}>
                                                            <Box sx={{ p: 1.5, bgcolor: alpha('#6366f1', 0.1), borderRadius: '12px' }}>
                                                                <QuizIcon sx={{ color: '#6366f1', fontSize: 24 }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                                                                    {quiz.title}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    ID: {quiz.quizId}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Chip
                                                            label={quiz.difficulty}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 800,
                                                                bgcolor: quiz.difficulty === 'EASY' ? alpha('#10b981', 0.1) :
                                                                    quiz.difficulty === 'MEDIUM' ? alpha('#f59e0b', 0.1) :
                                                                        alpha('#ef4444', 0.1),
                                                                color: quiz.difficulty === 'EASY' ? '#10b981' :
                                                                    quiz.difficulty === 'MEDIUM' ? '#f59e0b' : '#ef4444'
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Stats */}
                                                    <Stack spacing={2} sx={{ mb: 3 }}>
                                                        <Box>
                                                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                                <Typography variant="caption" fontWeight="700">Completion Rate</Typography>
                                                                <Typography variant="caption" fontWeight="800" color="primary">
                                                                    {stats.completionRate}%
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Number(stats.completionRate)}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 4,
                                                                    bgcolor: alpha('#6366f1', 0.1),
                                                                    '& .MuiLinearProgress-bar': {
                                                                        borderRadius: 4,
                                                                        bgcolor: '#6366f1'
                                                                    }
                                                                }}
                                                            />
                                                        </Box>

                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                                                    <Typography variant="caption" color="textSecondary" fontWeight="600">
                                                                        Assigned
                                                                    </Typography>
                                                                    <Typography variant="h6" fontWeight="900">
                                                                        {stats.totalAssigned}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                                                    <Typography variant="caption" color="textSecondary" fontWeight="600">
                                                                        Attempted
                                                                    </Typography>
                                                                    <Typography variant="h6" fontWeight="900">
                                                                        {stats.attempted}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                                                    <Typography variant="caption" color="textSecondary" fontWeight="600">
                                                                        Avg Score
                                                                    </Typography>
                                                                    <Typography variant="h6" fontWeight="900" color="primary">
                                                                        {stats.avgScore}%
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                                                    <Typography variant="caption" color="textSecondary" fontWeight="600">
                                                                        Questions
                                                                    </Typography>
                                                                    <Typography variant="h6" fontWeight="900">
                                                                        {quiz.questions?.length || 0}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </Stack>

                                                    {/* Actions */}
                                                    <Divider sx={{ mb: 2 }} />
                                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                                        <Box display="flex" gap={1}>
                                                            <Tooltip title="View Details">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleViewDetails(quiz)}
                                                                    sx={{
                                                                        bgcolor: alpha('#6366f1', 0.1),
                                                                        color: '#6366f1',
                                                                        '&:hover': { bgcolor: alpha('#6366f1', 0.2) }
                                                                    }}
                                                                >
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit Quiz">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditQuiz(quiz)}
                                                                    sx={{
                                                                        bgcolor: alpha('#10b981', 0.1),
                                                                        color: '#10b981',
                                                                        '&:hover': { bgcolor: alpha('#10b981', 0.2) }
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Quiz">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteQuiz(quiz.quizId || quiz.id)}
                                                                    sx={{
                                                                        bgcolor: alpha('#ef4444', 0.1),
                                                                        color: '#ef4444',
                                                                        '&:hover': { bgcolor: alpha('#ef4444', 0.2) }
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>

                                                        {stats.attempted > 0 && (
                                                            <Button
                                                                variant={stats.pendingManual > 0 ? "contained" : "outlined"}
                                                                size="small"
                                                                startIcon={<AssessmentIcon />}
                                                                onClick={() => handleViewDetails(quiz)}
                                                                sx={{
                                                                    borderRadius: '10px',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'none',
                                                                    px: 2,
                                                                    ...(stats.pendingManual > 0 ? {
                                                                        bgcolor: '#f59e0b',
                                                                        '&:hover': { bgcolor: '#d97706' }
                                                                    } : {
                                                                        color: '#64748b',
                                                                        borderColor: '#e2e8f0'
                                                                    })
                                                                }}
                                                            >
                                                                {stats.pendingManual > 0 ? `Grade (${stats.pendingManual})` : 'View Grades'}
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}

                        {/* Details Dialog */}
                        <Dialog
                            open={detailsDialogOpen}
                            onClose={() => setDetailsDialogOpen(false)}
                            maxWidth="md"
                            fullWidth
                            PaperProps={{
                                sx: { borderRadius: '24px', p: 2 }
                            }}
                        >
                            <DialogTitle>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <AssessmentIcon sx={{ color: '#6366f1', fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="h6" fontWeight="800">
                                            {selectedQuiz?.title}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Detailed Analytics & Student Attempts
                                        </Typography>
                                    </Box>
                                </Box>
                            </DialogTitle>
                            <DialogContent>
                                {loadingDetails ? (
                                    <Box display="flex" justifyContent="center" p={4}>
                                        <CircularProgress />
                                    </Box>
                                ) : quizDetails ? (
                                    <Stack spacing={3}>
                                        {/* Questions Preview */}
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="800" gutterBottom>
                                                Questions ({quizDetails.questions?.length || 0})
                                            </Typography>
                                            <List>
                                                {quizDetails.questions?.map((q, idx) => (
                                                    <ListItem
                                                        key={idx}
                                                        sx={{
                                                            bgcolor: '#f8fafc',
                                                            borderRadius: '12px',
                                                            mb: 1,
                                                            border: '1px solid #f1f5f9'
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="body2" fontWeight="700">
                                                                    Q{idx + 1}. {q.questionText || q.question}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Typography variant="caption" color="textSecondary">
                                                                    Correct Answer: {q.correctAnswer}
                                                                </Typography>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>

                                        <Divider />

                                        {/* Student Progress List */}
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="800" gutterBottom>
                                                Student Performance & Status
                                            </Typography>

                                            {/* Computed List of All Assigned Students */}
                                            <List>
                                                {(() => {
                                                    const assigned = quizDetails.assignedStudents || [];
                                                    const attempts = quizDetails.attempts || [];

                                                    // If no students assigned, show empty state or just attempts if any exist (legacy)
                                                    if (assigned.length === 0 && attempts.length === 0) {
                                                        return (
                                                            <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                                                                No students assigned to this quiz.
                                                            </Typography>
                                                        );
                                                    }

                                                    // Create a map of attempts by studentId for O(1) lookup
                                                    // Handle potential inconsistencies in ID naming (studentId vs id)
                                                    const attemptsMap = new Map();
                                                    attempts.forEach(a => {
                                                        // Only Map if ID exists
                                                        if (a.studentId !== undefined && a.studentId !== null) {
                                                            attemptsMap.set(Number(a.studentId), a);
                                                        }
                                                    });

                                                    // Merge lists. 
                                                    // We iterate over ASSIGNED students to ensure everyone is listed.
                                                    // If someone attempted but wasn't in assigned list (rare edge case), we might miss them here 
                                                    // unless we combine lists. Let's do a combined unique set of IDs.

                                                    const allStudentIds = new Set([
                                                        ...assigned.map(s => s.id),
                                                        ...attempts.map(a => a.studentId).filter(id => id !== undefined && id !== null)
                                                    ]);

                                                    return Array.from(allStudentIds).map(studentId => {
                                                        const numberId = Number(studentId);
                                                        const studentInfo = assigned.find(s => s.id === numberId);
                                                        const attempt = attemptsMap.get(numberId);

                                                        // Determine display details
                                                        // Fallback for name if studentInfo is missing
                                                        const displayName = studentInfo?.name || attempt?.studentName || `Student #${numberId || '?'}`;
                                                        const hasAttempted = !!attempt;
                                                        const score = attempt?.score;
                                                        const submittedDate = attempt?.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "--";

                                                        return (
                                                            <ListItem
                                                                key={numberId}
                                                                sx={{
                                                                    bgcolor: '#f8fafc',
                                                                    borderRadius: '12px',
                                                                    mb: 1,
                                                                    border: '1px solid #f1f5f9'
                                                                }}
                                                            >
                                                                <Avatar
                                                                    sx={{
                                                                        mr: 2,
                                                                        bgcolor: hasAttempted ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                                                        color: hasAttempted ? '#10b981' : '#f59e0b'
                                                                    }}
                                                                >
                                                                    {displayName.charAt(0)}
                                                                </Avatar>
                                                                <ListItemText
                                                                    primary={
                                                                        <Typography variant="body2" fontWeight="700">
                                                                            {displayName}
                                                                        </Typography>
                                                                    }
                                                                    secondary={
                                                                        hasAttempted ? (
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                                                                                <Typography variant="caption" color="textSecondary">
                                                                                    Completed • {submittedDate}
                                                                                </Typography>
                                                                            </Box>
                                                                        ) : (
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <ScheduleIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                                                                                <Typography variant="caption" color="#f59e0b" fontWeight="600">
                                                                                    Pending Submission
                                                                                </Typography>
                                                                            </Box>
                                                                        )
                                                                    }
                                                                />

                                                                {/* GRADING ACTION */}
                                                                {hasAttempted && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        onClick={() => {
                                                                            if (attempt?.id || attempt?.attemptId) {
                                                                                navigate(`/instructor/grading/${attempt.id || attempt.attemptId}`);
                                                                            } else {
                                                                                alert("Attempt ID missing");
                                                                            }
                                                                        }}
                                                                        sx={{ mr: 2 }}
                                                                    >
                                                                        Grade
                                                                    </Button>
                                                                )}

                                                                {hasAttempted ? (
                                                                    <Chip
                                                                        label={`${score}%`}
                                                                        size="small"
                                                                        sx={{
                                                                            fontWeight: 800,
                                                                            bgcolor: score >= 70 ? alpha('#10b981', 0.1) :
                                                                                score >= 50 ? alpha('#f59e0b', 0.1) :
                                                                                    alpha('#ef4444', 0.1),
                                                                            color: score >= 70 ? '#10b981' :
                                                                                score >= 50 ? '#f59e0b' : '#ef4444'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Chip
                                                                        label="--"
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ color: '#94a3b8', borderColor: '#e2e8f0' }}
                                                                    />
                                                                )}
                                                            </ListItem>
                                                        );
                                                    });
                                                })()}
                                            </List>
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Failed to load details
                                    </Typography>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setDetailsDialogOpen(false)} sx={{ borderRadius: '12px', fontWeight: 700 }}>
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Integrated Grading Dialog */}
                        <Dialog
                            open={gradingDialogOpen}
                            onClose={() => !submittingGrades && setGradingDialogOpen(false)}
                            maxWidth="md"
                            fullWidth
                            PaperProps={{
                                sx: { borderRadius: '24px', p: 1 }
                            }}
                        >
                            <DialogTitle>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ bgcolor: '#6366f1' }}>{selectedAttemptReview?.studentName?.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight="900">{selectedAttemptReview?.studentName}</Typography>
                                            <Typography variant="caption" color="textSecondary">Grading: {selectedAttemptReview?.quizTitle}</Typography>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={() => setGradingDialogOpen(false)} disabled={submittingGrades}>
                                        <ArrowBackIcon />
                                    </IconButton>
                                </Box>
                            </DialogTitle>
                            <DialogContent dividers sx={{ border: 'none' }}>
                                <Stack spacing={3} sx={{ py: 1 }}>
                                    {selectedAttemptReview?.questions?.map((q, idx) => (
                                        <Paper key={q.responseId} sx={{ p: 3, borderRadius: '16px', border: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                                            <Box display="flex" justifyContent="space-between" mb={2}>
                                                <Typography variant="subtitle1" fontWeight="800">
                                                    {idx + 1}. {q.questionText}
                                                </Typography>
                                                <Chip
                                                    label={`${q.type} ANSWER`}
                                                    size="small"
                                                    sx={{ fontWeight: 800, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}
                                                />
                                            </Box>

                                            <Box sx={{ mb: 3, p: 2.5, bgcolor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>
                                                    STUDENT'S RESPONSE
                                                </Typography>
                                                <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                    {q.studentAnswer || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No response provided.</span>}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={2}>
                                                <TextField
                                                    label="Marks Awarded"
                                                    type="number"
                                                    size="small"
                                                    InputProps={{ inputProps: { min: 0, max: q.maxMarks } }}
                                                    value={itemGrades[q.responseId] || ''}
                                                    onChange={(e) => setItemGrades(prev => ({ ...prev, [q.responseId]: e.target.value }))}
                                                    sx={{ width: 140, bgcolor: 'white' }}
                                                />
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                                                    Out of {q.maxMarks} max marks
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{ p: 3, pt: 0 }}>
                                <Button
                                    onClick={() => setGradingDialogOpen(false)}
                                    sx={{ borderRadius: '12px', fontWeight: 800, color: '#64748b' }}
                                    disabled={submittingGrades}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmitGrades}
                                    disabled={submittingGrades}
                                    sx={{
                                        borderRadius: '12px',
                                        px: 4,
                                        fontWeight: 800,
                                        bgcolor: '#1e293b',
                                        '&:hover': { bgcolor: '#0f172a' }
                                    }}
                                >
                                    {submittingGrades ? <CircularProgress size={20} color="inherit" /> : 'Submit All Grades'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Container >
            </Box >
        </Box >
    );
};

export default QuizAnalyticsDashboard;
