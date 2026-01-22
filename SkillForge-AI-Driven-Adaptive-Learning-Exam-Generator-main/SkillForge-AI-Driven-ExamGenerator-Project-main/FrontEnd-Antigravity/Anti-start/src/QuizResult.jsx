import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuickResultByQuiz, getFullSummaryByQuiz } from "./services/quizResultService";
import { aiService } from "./services/aiService";
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Alert,
    LinearProgress,
    Grid,
    Divider as MuiDivider,
    alpha,
    Card,
    CardContent,
    Collapse
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    EmojiEvents as TrophyIcon,
    Lightbulb as LightbulbIcon,
    ExpandMore as ExpandMoreIcon,
    AutoAwesome as AIIcon
} from "@mui/icons-material";

const QuizResult = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quickResult, setQuickResult] = useState(null);
    const [fullSummary, setFullSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiSuggestions, setAiSuggestions] = useState("");
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    useEffect(() => {
        console.log("[QUIZ_RESULT] Component Mounted. QuizID:", quizId);
        if (!quizId) {
            setError("No Quiz ID found in URL.");
            setLoading(false);
            return;
        }

        const loadResults = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log("[QUIZ_RESULT] Starting API calls...");
                const [quick, summary] = await Promise.all([
                    getQuickResultByQuiz(quizId),
                    getFullSummaryByQuiz(quizId)
                ]);

                console.log("[QUIZ_RESULT] API calls successful.");
                console.log("[QUIZ_RESULT] Quick Result Data:", JSON.stringify(quick, null, 2));
                console.log("[QUIZ_RESULT] Full Summary Data:", JSON.stringify(summary, null, 2));

                if (!quick && !summary) {
                    setError("No data returned from server for this quiz.");
                } else {
                    setQuickResult(quick);
                    setFullSummary(summary);
                }
            } catch (err) {
                console.error("[QUIZ_RESULT] Error during loading:", err);
                setError("Could not load results. The server may not have graded your attempt yet, or the quiz doesn't exist.");
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, [quizId]);

    const handleDownloadJson = () => {
        if (!fullSummary) return;
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(fullSummary, null, 2)], { type: "application/json" });
        element.href = URL.createObjectURL(file);
        element.download = `Quiz_Summary_${fullSummary.quizTitle || 'Report'}.json`;
        document.body.appendChild(element);
        element.click();
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Syncing Official Transcript...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
            <Alert severity="warning" sx={{ maxWidth: 600, borderRadius: 4, mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Result Unavailable</Typography>
                {error}
            </Alert>
            <Button variant="outlined" onClick={() => navigate('/student/quizzes')} sx={{ borderRadius: 3 }}>
                Return to Quizzes
            </Button>
        </Box>
    );

    const data = fullSummary || quickResult;
    const score = data?.totalScore ?? data?.score ?? 0;
    let totalMarks = data?.totalMarks ?? data?.maxMarks ?? data?.totalQuestions ?? 0;

    // Fallback: If totalMarks is missing but we have question data, sum up max marks
    if (totalMarks === 0 && data?.questions?.length > 0) {
        totalMarks = data.questions.reduce((sum, q) => sum + (q.maxMarks || 0), 0);
    }

    // Final defensive fallback: never let totalMarks be 0 if we're dividing
    const effectiveTotalMarks = totalMarks > 0 ? totalMarks : 100;

    // Calculate percentage based on the data provided by the API first
    let percentage = 0;
    if (typeof data?.percentage === 'number' && data.percentage >= 0) {
        percentage = Math.round(data.percentage);
    } else {
        percentage = Math.round((score / effectiveTotalMarks) * 100);
    }

    // Ensure percentage is within valid range
    percentage = Math.max(0, Math.min(100, percentage));

    // Determine pass status
    const isPass = data?.passStatus?.toLowerCase() === "pass" || (percentage >= 50);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', p: { xs: 2, md: 4 } }}>
            <style>
                {`
                    @media print {
                        @page { size: A4; margin: 15mm; }
                        body { background: white !important; margin: 0; padding: 0; }
                        .no-print { display: none !important; }
                        #printable-content { 
                            box-shadow: none !important; 
                            border: none !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                        }
                        .transcript-header { border-bottom: 2px solid #1e293b !important; padding-bottom: 20px !important; }
                        .question-card { break-inside: avoid; border: 1px solid #e2e8f0 !important; margin-bottom: 15px !important; }
                    }
                `}
            </style>

            <Box sx={{ maxWidth: 900, mx: 'auto' }} id="printable-content">
                <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/student/quizzes')}
                        sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
                    >
                        Back to Quizzes
                    </Button>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadJson}
                            sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#334155' }}
                        >
                            JSON
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            sx={{
                                bgcolor: '#1e293b',
                                '&:hover': { bgcolor: '#0f172a' },
                                fontWeight: 700,
                                borderRadius: 3,
                                px: 3,
                                textTransform: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}
                        >
                            Save as PDF / Print
                        </Button>
                    </Stack>
                </Box>

                <Paper sx={{
                    p: { xs: 4, md: 8 },
                    borderRadius: 0,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
                    background: 'white',
                    mb: 4,
                    borderTop: '12px solid #1e293b'
                }}>
                    <Box className="transcript-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6, pb: 4, borderBottom: '1px solid #e2e8f0' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '0.05em' }}>SKILLFORGE ACADEMY</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Verified Assessment Report</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>EXAM TRANSCRIPT</Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>ISSUE DATE: {new Date().toLocaleDateString()}</Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid item xs={12} md={7}>
                            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>STUDENT INFORMATION</Typography>
                            <Box sx={{ mt: 1, p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>NAME</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>{fullSummary?.studentName || "Verified Student"}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>STUDENT ID</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>{fullSummary?.studentId || "N/A"}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800 }}>ASSESSMENT DETAILS</Typography>
                            <Box sx={{ mt: 1, p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mt: 1 }}>DATE ATTEMPTED</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{data?.attemptDate ? new Date(data.attemptDate).toLocaleString() : (data?.submittedAt ? new Date(data.submittedAt).toLocaleString() : "Recently")}</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mb: 6, p: 3, bgcolor: '#1e293b', color: 'white', textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>ASSESSMENT SUBJECT</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{data?.quizTitle || data?.title || "Technical Quiz"}</Typography>
                    </Box>

                    <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 800, mb: 2, display: 'block' }}>PERFORMANCE ANALYTICS</Typography>
                    <Grid container spacing={2} sx={{ mb: 6 }}>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, border: '2px solid #e2e8f0', textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>{score} / {totalMarks}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>TOTAL SCORE</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, border: '2px solid #e2e8f0', textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#6366f1' }}>{percentage}%</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>ACCURACY</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, border: '2px solid #e2e8f0', textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: isPass ? '#10b981' : '#f43f5e' }}>{totalMarks === 0 ? (isPass ? "PASS" : "FAIL") : (data?.passStatus || data?.status || (isPass ? "PASS" : "FAIL"))}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>STATUS</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ px: 2, mb: 8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>MASTERY SCALE</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b' }}>{percentage}%</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                                height: 10,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': { bgcolor: isPass ? '#10b981' : '#f43f5e' }
                            }}
                        />
                    </Box>

                    {fullSummary && (
                        <Box sx={{ breakAfter: 'page' }}>
                            <Divider sx={{ mb: 4 }} />
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, letterSpacing: '0.05em' }}>DETAILED RESPONSE REVIEW</Typography>

                            <Stack spacing={4}>
                                {fullSummary.questions.map((q, idx) => {
                                    // Determine if answer is correct for MCQs
                                    const isMCQ = q.type === 'MCQ' || q.questionType === 'MCQ' || q.type === 'MULTIPLE_CHOICE';
                                    const isCorrect = isMCQ
                                        ? (q.studentAnswer === q.correctAnswer ||
                                            (typeof q.studentAnswer === 'number' && q.studentAnswer === parseInt(q.correctAnswer)))
                                        : q.marksAwarded > 0; // For long answers, use marks awarded

                                    console.log(`[QUESTION_${idx}] Type: ${q.type}, Student: ${q.studentAnswer}, Correct: ${q.correctAnswer}, IsCorrect: ${isCorrect}`);

                                    return (
                                        <Box key={idx} className="question-card" sx={{ p: 3, bgcolor: '#fdfdfd', border: '1px solid #f1f5f9' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', flex: 1, pr: 2 }}>
                                                    ITEM {idx + 1}: {q.question || q.questionText || "Abstract Question"}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>
                                                    POINTS AWARDED: {q.marksAwarded || 0}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, display: 'block', mb: 0.5 }}>STUDENT RESPONSE</Typography>
                                                <Typography variant="body2" sx={{ color: '#334155', p: 1.5, borderLeft: '3px solid #cbd5e1', bgcolor: '#f8fafc' }}>
                                                    {q.studentAnswer || "(No Answer Entered)"}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, display: 'block', mb: 0.5 }}>REFERENCE KEY</Typography>
                                                <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 600 }}>
                                                    {q.correctAnswer || "Proprietary Solution Key"}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: isCorrect ? '#10b981' : '#f43f5e' }}>
                                                    RESULT: {isCorrect ? 'VALIDATED' : 'INCORRECT'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8' }}>
                                                    EVAL: {q.evaluationStatus || 'AUTOMATED'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>
                    )}

                    {/* AI RECOMMENDATIONS SECTION */}
                    <Box sx={{ mt: 6, mb: 6, breakAfter: 'page' }} className="no-print">
                        <Card sx={{
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            bgcolor: alpha('#6366f1', 0.02)
                        }}>
                            <Box sx={{
                                p: 3,
                                bgcolor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AIIcon sx={{ color: 'white', fontSize: 28 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 800 }}>
                                            AI Study Recommendations
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                            Personalized tips to improve your performance
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                        if (!aiSuggestions && !loadingSuggestions) {
                                            setLoadingSuggestions(true);
                                            aiService.generateStudySuggestions({
                                                quizTitle: data?.quizTitle || data?.title || 'Quiz',
                                                score,
                                                totalMarks,
                                                percentage,
                                                incorrectQuestions: fullSummary?.questions
                                                    ?.filter(q => {
                                                        const isMCQ = q.type === 'MCQ' || q.questionType === 'MCQ' || q.type === 'MULTIPLE_CHOICE';
                                                        const isCorrect = isMCQ
                                                            ? (q.studentAnswer === q.correctAnswer ||
                                                                (typeof q.studentAnswer === 'number' && q.studentAnswer === parseInt(q.correctAnswer)))
                                                            : q.marksAwarded > 0;
                                                        return !isCorrect;
                                                    })
                                                    ?.map(q => ({
                                                        question: q.question || q.questionText,
                                                        studentAnswer: q.studentAnswer,
                                                        correctAnswer: q.correctAnswer,
                                                        type: q.type || q.questionType
                                                    })) || []
                                            }).then(suggestions => {
                                                setAiSuggestions(suggestions);
                                                setLoadingSuggestions(false);
                                            });
                                        } else {
                                            setShowSuggestions(!showSuggestions);
                                        }
                                    }}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    {loadingSuggestions ? 'Generating...' : (aiSuggestions ? (showSuggestions ? 'Hide' : 'Show') : 'Get Tips')}
                                </Button>
                            </Box>
                            <Collapse in={showSuggestions && (aiSuggestions || loadingSuggestions)}>
                                <CardContent sx={{ p: 4 }}>
                                    {loadingSuggestions ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', py: 4 }}>
                                            <CircularProgress size={24} />
                                            <Typography color="text.secondary">Analyzing your performance...</Typography>
                                        </Box>
                                    ) : aiSuggestions ? (
                                        <Stack spacing={2}>
                                            {aiSuggestions.split('\n\n').map((suggestion, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        p: 2.5,
                                                        bgcolor: idx % 2 === 0 ? '#f8fafc' : 'white',
                                                        borderRadius: 2,
                                                        borderLeft: '4px solid',
                                                        borderColor: 'primary.main'
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            color: '#334155',
                                                            lineHeight: 1.7,
                                                            '& strong': { color: '#1e293b' }
                                                        }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: suggestion
                                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                                .replace(/\n/g, '<br/>')
                                                        }}
                                                    />
                                                </Box>
                                            ))}

                                            {/* Quiz Navigation Recommendations */}
                                            <Box sx={{ mt: 4, p: 3, bgcolor: alpha('#6366f1', 0.05), borderRadius: 3, border: '1px solid', borderColor: alpha('#6366f1', 0.2) }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#1e293b' }}>
                                                    📚 Next Steps
                                                </Typography>
                                                <Stack spacing={2}>
                                                    {percentage >= 70 ? (
                                                        <>
                                                            <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
                                                                🎉 Excellent work! You're ready for more advanced topics.
                                                            </Typography>
                                                            <Button
                                                                variant="contained"
                                                                onClick={() => navigate('/student/quizzes')}
                                                                sx={{
                                                                    bgcolor: '#10b981',
                                                                    '&:hover': { bgcolor: '#059669' },
                                                                    borderRadius: 2,
                                                                    fontWeight: 700,
                                                                    textTransform: 'none'
                                                                }}
                                                            >
                                                                🚀 Take Next Level Quiz
                                                            </Button>
                                                        </>
                                                    ) : percentage >= 50 ? (
                                                        <>
                                                            <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
                                                                👍 Good progress! Practice a bit more to master this topic.
                                                            </Typography>
                                                            <Stack direction="row" spacing={2}>
                                                                <Button
                                                                    variant="outlined"
                                                                    onClick={() => window.location.reload()}
                                                                    sx={{
                                                                        borderColor: '#f59e0b',
                                                                        color: '#f59e0b',
                                                                        '&:hover': { borderColor: '#d97706', bgcolor: alpha('#f59e0b', 0.05) },
                                                                        borderRadius: 2,
                                                                        fontWeight: 700,
                                                                        textTransform: 'none'
                                                                    }}
                                                                >
                                                                    🔄 Retake This Quiz
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => navigate('/student/quizzes')}
                                                                    sx={{
                                                                        bgcolor: '#6366f1',
                                                                        '&:hover': { bgcolor: '#4f46e5' },
                                                                        borderRadius: 2,
                                                                        fontWeight: 700,
                                                                        textTransform: 'none'
                                                                    }}
                                                                >
                                                                    📚 Browse More Quizzes
                                                                </Button>
                                                            </Stack>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
                                                                📖 Don't worry! Review the materials and try again.
                                                            </Typography>
                                                            <Stack direction="row" spacing={2}>
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => window.location.reload()}
                                                                    sx={{
                                                                        bgcolor: '#ef4444',
                                                                        '&:hover': { bgcolor: '#dc2626' },
                                                                        borderRadius: 2,
                                                                        fontWeight: 700,
                                                                        textTransform: 'none'
                                                                    }}
                                                                >
                                                                    🔄 Retake Quiz
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    onClick={() => {
                                                                        // Try to extract topic info from quiz data to route to materials
                                                                        const topicId = data?.topicId || fullSummary?.topicId;
                                                                        const courseId = data?.courseId || fullSummary?.courseId;

                                                                        if (topicId && courseId) {
                                                                            navigate(`/student/course/${courseId}/topic/${topicId}/materials`);
                                                                        } else if (topicId) {
                                                                            navigate(`/student/materials/${topicId}`);
                                                                        } else {
                                                                            navigate('/student/courses');
                                                                        }
                                                                    }}
                                                                    sx={
                                                                        {
                                                                            borderColor: '#6366f1',
                                                                            color: '#6366f1',
                                                                            '&:hover': { borderColor: '#4f46e5', bgcolor: alpha('#6366f1', 0.05) },
                                                                            borderRadius: 2,
                                                                            fontWeight: 700,
                                                                            textTransform: 'none'
                                                                        }
                                                                    }
                                                                >
                                                                    📚 Study Materials
                                                                </Button>
                                                            </Stack>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    ) : null}
                                </CardContent>
                            </Collapse>
                        </Card>
                    </Box>

                    <Box sx={{ mt: 10, textAlign: 'center', opacity: 0.6 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 800 }}>SkillForge Learning Systems Digital Certification</Typography>
                        <Divider sx={{ mb: 2, maxWidth: 300, mx: 'auto' }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>Report ID: SF-{quizId}-{Math.floor(Math.random() * 10000)} • Authenticated Assessment</Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default QuizResult;
