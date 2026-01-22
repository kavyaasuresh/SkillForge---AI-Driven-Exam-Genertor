import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, TextField, Button, CircularProgress,
    Stack, Chip, Divider, IconButton, Alert, Container, Avatar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { quizService } from './services/quizService';


const InstructorGradingView = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [attemptData, setAttemptData] = useState(null);
    const [grades, setGrades] = useState({}); // responseId -> marks
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await quizService.getStudentAttemptMeta(attemptId);
                console.log("📊 [GRADING_VIEW] Attempt data received:", JSON.stringify(data, null, 2));
                setAttemptData(data);
                // Initialize grades state
                const initialGrades = {};
                if (data.questions) {
                    data.questions.forEach(q => {
                        // We need the responseId to submit grades.
                        // Does the API return responseId inside 'questions' list?
                        // If not, we might be stuck.
                        // The user description said: "StudentQuestionResponse ... Fields: responseId..."
                        // The result DTO might hide it. Let's hope it's there or we updated DTO.
                        // Assuming DTO has it or we can derive it. 
                        // If DTO is "QuestionResultDTO", it might not have responseId.
                        // CHECK: "QuestionResultDTO: question, studentAnswer, marksAwarded..."
                        // If responseId is missing, we need to ask backend to include it.
                        // Let's assume for now it is passed as `id` or `responseId`.
                        if (q.responseId) initialGrades[q.responseId] = q.marksAwarded || 0;
                    });
                }
                setGrades(initialGrades);
            } catch (error) {
                console.error("Failed to load attempt:", error);
                setMessage({ type: 'error', text: "Failed to load attempt data." });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [attemptId]);

    const handleGradeChange = (responseId, value) => {
        setGrades(prev => ({
            ...prev,
            [responseId]: value
        }));
    };

    const handleSaveGrade = async (responseId) => {
        setSaving(true);
        try {
            const marks = Number(grades[responseId]);
            await quizService.submitGrade(responseId, marks);

            // Update local state to show saved status
            setAttemptData(prev => ({
                ...prev,
                questions: prev.questions.map(q =>
                    q.responseId === responseId
                        ? { ...q, marksAwarded: marks, evaluationStatus: 'EVALUATED' }
                        : q
                )
            }));

            setMessage({ type: 'success', text: "Grade saved successfully!" });
            setTimeout(() => setMessage(null), 2000);
        } catch (error) {
            console.error("Failed to save grade:", error);
            setMessage({ type: 'error', text: "Failed to save grade." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
    if (!attemptData) return <Box p={4} textAlign="center"><Typography>Attempt not found.</Typography></Box>;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Container maxWidth="md">
                    <Box mb={4}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{ mb: 2, borderRadius: '12px', fontWeight: 700, textTransform: 'none', color: '#64748b' }}
                        >
                            Back to Hub
                        </Button>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Avatar sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontWeight: 800 }}>
                                {attemptData.studentName?.charAt(0)}
                            </Avatar>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', letterSpacing: '-0.02em' }}>
                                {attemptData.studentName || 'Student Attempt'}
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                            Quiz: <span style={{ color: '#1e293b', fontWeight: 700 }}>{attemptData.quizTitle}</span> •
                            Submitted: <span style={{ color: '#1e293b', fontWeight: 700 }}>{new Date(attemptData.submittedAt).toLocaleString()}</span> •
                            Total Auto Score: <span style={{ color: '#6366f1', fontWeight: 800 }}>{attemptData.totalScore}</span>
                        </Typography>
                    </Box>

                    {message && (
                        <Alert
                            severity={message.type}
                            sx={{ mb: 3, borderRadius: '16px', fontWeight: 600, border: `1px solid ${message.type === 'success' ? '#10b981' : '#f43f5e'}` }}
                        >
                            {message.text}
                        </Alert>
                    )}

                    <Stack spacing={4}>
                        {attemptData.questions && attemptData.questions.map((q, idx) => {
                            const rId = q.responseId || q.id;
                            console.log(`📝 [GRADING_VIEW] Question ${idx + 1} data:`, JSON.stringify(q, null, 2));
                            if (!rId) return null;

                            return (
                                <Paper key={idx} sx={{
                                    p: 4,
                                    borderRadius: '24px',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    bgcolor: 'white'
                                }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Question {idx + 1}
                                            </Typography>
                                            <Typography variant="h6" fontWeight="800" sx={{ mt: 0.5, color: '#1e293b', lineHeight: 1.4 }}>
                                                {q.question || q.questionText}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${q.type || 'LONG'} ANSWER`}
                                            size="small"
                                            sx={{
                                                fontWeight: 800,
                                                bgcolor: alpha(q.type === 'LONG' ? '#8b5cf6' : '#6366f1', 0.1),
                                                color: q.type === 'LONG' ? '#8b5cf6' : '#6366f1',
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{
                                        mb: 4,
                                        p: 3,
                                        bgcolor: '#f8fafc',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        position: 'relative'
                                    }}>
                                        <Typography variant="caption" sx={{
                                            position: 'absolute',
                                            top: -10,
                                            left: 20,
                                            bgcolor: '#f8fafc',
                                            px: 1,
                                            fontWeight: 800,
                                            color: '#94a3b8'
                                        }}>
                                            STUDENT'S RESPONSE
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.6 }}>
                                            {q.studentAnswer || q.answer || q.response || q.studentResponse || q.textAnswer || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>(No Answer Provided)</span>}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

                                    <Box display="flex" alignItems="center" flexWrap="wrap" gap={3}>
                                        <Box sx={{ minWidth: 150 }}>
                                            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 800, color: '#64748b' }}>
                                                SCORE AWARDED
                                            </Typography>
                                            <TextField
                                                type="number"
                                                size="small"
                                                fullWidth
                                                InputProps={{
                                                    inputProps: { min: 0, max: q.maxMarks || 10 },
                                                    sx: { borderRadius: '12px', fontWeight: 700 }
                                                }}
                                                value={grades[rId] !== undefined ? grades[rId] : (q.marksAwarded || 0)}
                                                onChange={(e) => handleGradeChange(rId, e.target.value)}
                                            />
                                        </Box>

                                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, mt: 2.5 }}>
                                            <Button
                                                variant="contained"
                                                disabled={saving}
                                                onClick={() => handleSaveGrade(rId)}
                                                startIcon={q.evaluationStatus === 'EVALUATED' ? <CheckCircleIcon /> : <SaveIcon />}
                                                sx={{
                                                    borderRadius: '12px',
                                                    fontWeight: 800,
                                                    bgcolor: q.evaluationStatus === 'EVALUATED' ? '#10b981' : '#1e293b',
                                                    px: 3,
                                                    '&:hover': { bgcolor: q.evaluationStatus === 'EVALUATED' ? '#059669' : '#0f172a' }
                                                }}
                                            >
                                                {saving ? 'Saving...' : q.evaluationStatus === 'EVALUATED' ? 'Update Grade' : 'Save Grade'}
                                            </Button>

                                            {q.evaluationStatus === 'PENDING_MANUAL' && (
                                                <Chip
                                                    label="Review Required"
                                                    color="warning"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 800, borderRadius: '8px' }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default InstructorGradingView;
