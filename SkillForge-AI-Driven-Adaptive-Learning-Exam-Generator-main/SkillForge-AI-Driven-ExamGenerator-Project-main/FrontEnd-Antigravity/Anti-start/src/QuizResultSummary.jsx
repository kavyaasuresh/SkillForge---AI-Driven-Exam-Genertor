import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Chip,
    Divider,
    Stack,
    Alert,
    AlertTitle,
    IconButton,
    Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Help as HelpIcon,
    EmojiEvents as TrophyIcon,
    Pending as PendingIcon
} from '@mui/icons-material';
import { quizService } from './services/quizService';
import { useStudent } from './context/StudentContext';
import { useAuth } from './context/AuthContext';

const QuizResultSummary = () => {
    const { attemptId } = useParams();
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { studentData } = useStudent();
    const { quizzes } = studentData;

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [suggestion, setSuggestion] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const data = await quizService.getQuizResult(attemptId);
                console.log("Quiz Result Data:", data);
                setResult(data);
            } catch (err) {
                console.error("Failed to load result:", err);
                setError("Could not load result. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (attemptId) {
            fetchResult();
        }
    }, [attemptId]);

    useEffect(() => {
        if (result && quizzes && quizzes.length > 0) {
            const currentQuiz = quizzes.find(q => Number(q.quiz_id) === Number(result.quizId || quizId));
            if (!currentQuiz) return;

            const percentage = result.totalMarks > 0 ? (result.totalScore / result.totalMarks) * 100 : 0;
            const diffLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
            const currentIdx = diffLevels.indexOf(currentQuiz.difficulty?.toUpperCase());

            let targetDiff = null;
            if (percentage >= 80) {
                if (currentIdx < diffLevels.length - 1) targetDiff = diffLevels[currentIdx + 1];
            } else if (percentage < 50) {
                if (currentIdx > 0) targetDiff = diffLevels[currentIdx - 1];
                else targetDiff = "BEGINNER";
            }

            if (targetDiff) {
                const recommended = quizzes.find(q =>
                    q.difficulty?.toUpperCase() === targetDiff &&
                    q.status !== 'ATTEMPTED' &&
                    q.status !== 'COMPLETED' &&
                    Number(q.quiz_id) !== Number(result.quizId || quizId)
                );
                if (recommended) {
                    setSuggestion(recommended);
                }
            }
        }
    }, [result, quizzes, quizId]);

    const handleDownload = () => {
        window.print();
    };

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Loading Results...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <Alert severity="error" sx={{ maxWidth: 500 }}>{error}</Alert>
        </Box>
    );

    if (!result) return null;

    // Helper to get status color and icon
    const getStatusConfig = (status, marks) => {
        if (status === 'PENDING_MANUAL' || status === 'PENDING') return { color: 'warning', icon: <PendingIcon />, label: 'Wait for Grade' };
        if (marks > 0) return { color: 'success', icon: <CheckCircleIcon />, label: 'Correct' };
        return { color: 'error', icon: <CancelIcon />, label: 'Incorrect' };
    };

    const isPendingManual = result.evaluationStatus === 'PENDING_MANUAL' || result.questions?.some(q => q.evaluationStatus === 'PENDING_MANUAL');
    const percentage = result.totalMarks > 0 ? Math.round((result.totalScore / result.totalMarks) * 100) : 0;
    const totalQuestions = result.questions?.length || 0;
    const correctCount = result.questions?.filter(q => q.marksAwarded > 0).length || 0;
    const attendedCount = result.questions?.filter(q => q.studentAnswer && q.studentAnswer.trim() !== '').length || 0;
    const passStatus = percentage >= 50 ? 'PASSED' : 'RE-ATTEMPT SUGGESTED';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }}>
            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        @page { size: auto; margin: 20mm; }
                        body { background: white !important; }
                        .no-print { display: none !important; }
                        #printable-content { 
                            box-shadow: none !important; 
                            border: 1px solid #e2e8f0; 
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                        }
                        .score-badge { border: 2px solid #6366f1 !important; }
                        .exam-footer { display: block !important; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; text-align: center; color: #64748b; }
                    }
                `}
            </style>

            <Box sx={{ maxWidth: 900, mx: 'auto' }} id="printable-content">
                {/* Header Actions - No Print */}
                <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/student/quizzes')}
                        sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
                    >
                        Back to Quizzes
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            '&:hover': { background: '#0f172a' },
                            fontWeight: 700,
                            borderRadius: '12px',
                            px: 3,
                            py: 1.2,
                            textTransform: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                    >
                        Save as PDF / Print
                    </Button>
                </Box>

                {/* Score Card / Resume Header */}
                <Paper sx={{
                    p: { xs: 4, md: 8 },
                    borderRadius: '0', // More document-like for print
                    mb: 4,
                    textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    background: 'white',
                    borderTop: '10px solid #1e293b' // Heavy top border for official look
                }}>
                    {/* Header: Branding & Title */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6, borderBottom: '3px solid #1e293b', pb: 4 }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '0.05em' }}>SKILLFORGE ACADEMY</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>AI-Driven Assessment & Certification</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>EXAM TRANSCRIPT</Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>Generated on: {new Date().toLocaleDateString()}</Typography>
                        </Box>
                    </Box>

                    {/* Student & Exam Meta Section */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid item xs={12} md={7}>
                            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>STUDENT IDENTIFICATION</Typography>
                            <Box sx={{ mt: 1, p: 3, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>NAME</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>{user?.name || user?.username || 'Student'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ID</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>{user?.studentId || user?.id || 'N/A'}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>ASSESSMENT METADATA</Typography>
                            <Box sx={{ mt: 1, p: 3, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ATTEMPT ID</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 800, color: '#6366f1', fontFamily: 'monospace' }}>{attemptId}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mt: 1 }}>DATE ATTEMPTED</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                    {result.createdAt ? new Date(result.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Quiz Title */}
                    <Box sx={{ mb: 6, p: 3, bgcolor: '#1e293b', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>SUBJECT / TOPIC</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{result.quizTitle || 'Assessment'}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{result.topicTitle || 'General Knowledge'}</Typography>
                    </Box>

                    {isPendingManual && (
                        <Alert severity="warning" sx={{ mb: 4, borderRadius: '16px', bgcolor: alpha('#f59e0b', 0.05), border: '1px solid', borderColor: alpha('#f59e0b', 0.2) }}>
                            <AlertTitle sx={{ fontWeight: 800 }}>Review in Progress</AlertTitle>
                            Your answers for long-form questions are currently being reviewed by your instructor. Your final score will be updated soon.
                        </Alert>
                    )}

                    {/* Performance Summary Grid */}
                    <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800, mb: 2, display: 'block' }}>PERFORMANCE SUMMARY</Typography>
                    <Grid container spacing={2} sx={{ mb: 6 }}>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, border: '2px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>{result.totalScore} / {result.totalMarks}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>TOTAL SCORE</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, border: '2px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#6366f1' }}>{percentage}%</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>ACCURACY</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, border: '2px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>{correctCount} / {totalQuestions}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>CORRECT ANSWERS</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sx={{ mt: 2 }}>
                            <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: '12px', textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155' }}>{attendedCount} / {totalQuestions}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>QUESTIONS ATTENDED</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sx={{ mt: 2 }}>
                            <Box sx={{ p: 2, bgcolor: percentage >= 50 ? '#ecfdf5' : '#fff1f2', borderRadius: '12px', textAlign: 'center', border: '1px solid', borderColor: percentage >= 50 ? '#10b981' : '#f43f5e' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: percentage >= 50 ? '#047857' : '#be123c' }}>{passStatus}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: percentage >= 50 ? '#059669' : '#e11d48' }}>STATUS</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* AI Suggestions Section - Now Included in Print */}
                    {!isPendingManual && (
                        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #f1f5f9' }}>
                            {percentage >= 80 ? (
                                <Alert severity="success" sx={{ borderRadius: '16px', textAlign: 'left', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                    <AlertTitle sx={{ fontWeight: 800 }}>Mastery Achieved! 🚀</AlertTitle>
                                    You have a strong grasp of this topic.
                                    {suggestion ? (
                                        <>We suggest challenging yourself with the <b>{suggestion.title}</b> ({suggestion.difficulty}) quiz next!</>
                                    ) : (
                                        <>Explore more <b>Advanced</b> quizzes from the catalog to maintain your streak!</>
                                    )}
                                </Alert>
                            ) : percentage < 50 ? (
                                <Alert severity="warning" sx={{ borderRadius: '16px', textAlign: 'left', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                    <AlertTitle sx={{ fontWeight: 800 }}>Learning Opportunity 📚</AlertTitle>
                                    Don't be discouraged! Take some time to review the concepts.
                                    {suggestion ? (
                                        <>We suggest trying the <b>{suggestion.title}</b> quiz next to build your confidence.</>
                                    ) : (
                                        <>We suggest <b>reviewing the lesson materials</b> before your next attempt.</>
                                    )}
                                </Alert>
                            ) : (
                                <Alert severity="info" sx={{ borderRadius: '16px', textAlign: 'left', border: '1px solid rgba(99, 102, 241, 0.1)', bgcolor: alpha('#6366f1', 0.05) }}>
                                    <AlertTitle sx={{ fontWeight: 800 }}>Solid Effort! ✨</AlertTitle>
                                    You're making great progress. Keep practicing to reach full mastery!
                                </Alert>
                            )}
                        </Box>
                    )}
                </Paper>

                {/* Questions Breakdown */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#334155' }}>Detailed Analysis</Typography>

                <Stack spacing={3}>
                    {result.questions && result.questions.map((q, idx) => {
                        const config = getStatusConfig(q.evaluationStatus, q.marksAwarded);
                        return (
                            <Paper key={idx} sx={{ p: 3, borderRadius: 3, borderLeft: '4px solid', borderColor: `${config.color}.main`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', flex: 1, pr: 2 }}>
                                        Q{idx + 1}. {q.question || q.questionText}
                                    </Typography>
                                    <Chip
                                        icon={config.icon}
                                        label={`${q.marksAwarded} Marks`}
                                        color={config.color}
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 700, border: 'none', bgcolor: `${config.color}.50` }}
                                    />
                                </Box>

                                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.5 }}>YOUR ANSWER</Typography>
                                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                                        {q.studentAnswer || '(No Answer)'}
                                    </Typography>
                                </Box>

                                {q.correctAnswer && q.evaluationStatus !== 'PENDING_MANUAL' && (
                                    <Box sx={{ p: 2, bgcolor: alpha('#10b981', 0.03), borderRadius: 2, border: '1px dashed', borderColor: alpha('#10b981', 0.2) }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', display: 'block', mb: 0.5 }}>CORRECT REFERENCE / ANSWER</Typography>
                                        <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 600 }}>
                                            {q.correctAnswer}
                                        </Typography>
                                    </Box>
                                )}

                                {q.evaluationStatus === 'PENDING_MANUAL' && (
                                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                        <PendingIcon fontSize="inherit" /> Pending Instructor Review
                                    </Typography>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>

                <Box sx={{ mt: 8, textAlign: 'center', color: '#cbd5e1' }} className="exam-footer">
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700, color: '#94a3b8' }}>SkillForge AI Learning Management System • Official Assessment Report</Typography>
                    <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Attempt ID: {attemptId} • Verified by Digital Signature Verification System</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default QuizResultSummary;
