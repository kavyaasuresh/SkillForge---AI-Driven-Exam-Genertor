import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    LinearProgress,
    IconButton,
    Alert,
    AlertTitle,
    Chip,
    Stack,
    CircularProgress,
    TextField
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    NavigateNext as NextIcon,
    NavigateBefore as PrevIcon,
    EmojiEvents as TrophyIcon,
    TimerOutlined as TimerIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quizService } from './services/quizService';
import { useStudent } from './context/StudentContext';
import { useAuth } from './context/AuthContext';

const QuizAttempt = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { studentData, refreshStudentData } = useStudent();
    const { quizzes } = studentData;

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [suggestion, setSuggestion] = useState(null);
    const [showChoice, setShowChoice] = useState(false);
    const [showSimpleResult, setShowSimpleResult] = useState(false);
    const [lastAttemptId, setLastAttemptId] = useState(null);

    // Timer States
    const [timeLeft, setTimeLeft] = useState(null); // seconds
    const [isTimerFinished, setIsTimerFinished] = useState(false);

    const isResultView = location.pathname.endsWith('/result');

    // Helper function for localStorage key
    const getTimerKey = () => `quiz_timer_${quizId}_${user?.id || 'guest'}`;

    useEffect(() => {
        const loadQuizData = async () => {
            setLoading(true);
            try {
                // Fetch basic quiz info and questions
                const [qData, quizDetails] = await Promise.all([
                    quizService.getQuestionsByQuizId(quizId),
                    quizService.getQuizById(quizId)
                ]);

                setQuiz(quizDetails || { title: 'Assigned Quiz', topic: 'Course Quiz' });
                console.log("[QUIZ_DEBUG] Full Quiz Details object:", quizDetails);
                console.log("[QUIZ_DEBUG] Quiz Details keys:", Object.keys(quizDetails || {}));
                console.log("[QUIZ_DEBUG] Quiz Details as JSON:", JSON.stringify(quizDetails, null, 2));

                if (quizDetails) {
                    console.log("[QUIZ_DEBUG] timeLimit:", quizDetails.timeLimit);
                    console.log("[QUIZ_DEBUG] time_limit:", quizDetails.time_limit);
                    console.log("[QUIZ_DEBUG] timeMinute:", quizDetails.timeMinute); // Some backends use this
                }

                // Initialize timer if not in result view
                if (!(quizDetails?.status === 'ATTEMPTED' || quizDetails?.status === 'COMPLETED' || isResultView)) {
                    const limitInMinutes = quizDetails?.timeLimit || quizDetails?.time_limit || quizDetails?.timeMinute || quizDetails?.duration || quizDetails?.time || quizDetails?.quizTimeLimit || quizDetails?.timeLimitMinutes || 30;
                    console.log("[QUIZ_DEBUG] final limitInMinutes:", limitInMinutes);
                    const fullTime = limitInMinutes * 60;
                    const savedTime = localStorage.getItem(getTimerKey());
                    const parsedSavedTime = savedTime ? parseInt(savedTime, 10) : null;
                    if (parsedSavedTime && parsedSavedTime > 0 && parsedSavedTime <= fullTime) {
                        setTimeLeft(parsedSavedTime);
                    } else {
                        setTimeLeft(fullTime);
                        localStorage.setItem(getTimerKey(), fullTime.toString());
                    }
                }

                // If it's a result view or the quiz is already attempted, we might want to show results directly
                if (quizDetails?.status === 'ATTEMPTED' || quizDetails?.status === 'COMPLETED' || isResultView) {
                    setResult({
                        score: quizDetails?.score || 0,
                        totalMarks: quizDetails?.totalMarks || 100,
                        percentage: Math.round(((quizDetails?.score || 0) / (quizDetails?.totalMarks || 100)) * 100)
                    });
                }

                if (qData && qData.length > 0) {
                    console.log("DEBUG: Raw questions from backend:", qData);

                    // ✅ HELPER: Normalize backend type strings to fixed internal types
                    const normalizeType = (type) => {
                        if (!type) return 'LONG';
                        const t = type.toString().toUpperCase();
                        if (['MCQ', 'MULTIPLE_CHOICE'].includes(t)) return 'MCQ';
                        if (['LONG', 'LONG_ANSWER', 'TEXT'].includes(t)) return 'LONG';
                        if (['SHORT', 'SHORT_ANSWER'].includes(t)) return 'SHORT';
                        return 'LONG'; // Default fallback
                    };

                    const mapped = qData.map(q => {
                        return {
                            ...q,
                            questionId: q.questionId || q.id || q.question_id,
                            questionText: q.questionText || q.question,
                            type: normalizeType(q.type || q.questionType), // 🔥 Robust mapping
                            options_array: Array.isArray(q.options) ? q.options.filter(o => o != null) : (q.options_array || []),
                            marks: q.marks || 10
                        };
                    });

                    console.log("[QUIZ_DEBUG] Final mapped questions:", mapped);
                    setQuestions(mapped);
                }
            } catch (error) {
                console.error("Error loading quiz content:", error);
            } finally {
                setLoading(false);
            }
        };
        loadQuizData();
    }, [quizId, isResultView]);

    // Timer Effect
    useEffect(() => {
        if (timeLeft === null || result || showChoice || showSimpleResult) return;

        if (timeLeft <= 0) {
            setIsTimerFinished(true);
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, result, showChoice, showSimpleResult]);

    // Save timer to localStorage whenever timeLeft changes
    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            localStorage.setItem(getTimerKey(), timeLeft.toString());
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionChange = (event) => {
        const currentQ = questions[currentQuestionIndex];
        const questionId = currentQ?.questionId;

        // Handle TEXT input for Long/Short/Text answers
        const isTextType = currentQ.type?.toUpperCase().includes('LONG') ||
            currentQ.type?.toUpperCase().includes('SHORT') ||
            currentQ.type?.toUpperCase().includes('TEXT');

        if (isTextType) {
            const textValue = event.target.value;
            setAnswers(prev => ({
                ...prev,
                [questionId]: textValue
            }));
            return;
        }

        // Handle MCQ (Radio)
        const selectedOption = Number(event.target.value);

        console.log(`Selecting option ${selectedOption} for questionId: ${questionId}`);

        if (!questionId) {
            console.error("Cannot set answer: questionId is undefined or NaN");
            return;
        }

        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const finalQuizId = Number(quiz?.quizId || quizId);
            const studentId = user?.studentId || user?.id;

            console.log(`[SUBMIT_DEBUG] Attempting Submission for Quiz ID: ${finalQuizId}`);

            // 1. Submit the quiz
            const response = await quizService.submitQuizAttempt(finalQuizId, answers);
            console.log("[SUBMIT_DEBUG] Submission response received:", response);

            // 2. Use response directly for simple result view
            setResult({
                score: response.score || 0,
                totalMarks: response.totalMarks || 100,
                percentage: response.percentage || (response.totalMarks > 0 ? Math.round((response.score / response.totalMarks) * 100) : 0),
                fromServer: true
            });

            setShowChoice(true);
            localStorage.removeItem(getTimerKey());

        } catch (error) {
            console.error("[SUBMIT_DEBUG] Submission failed:", error);
            alert(`Submission error: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (result && quizzes && quizzes.length > 0) {
            const currentQuiz = quizzes.find(q => Number(q.quiz_id) === Number(quizId));
            if (!currentQuiz) return;

            const diffLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
            const currentIdx = diffLevels.indexOf(currentQuiz.difficulty?.toUpperCase());

            let targetDiff = null;
            if (result.percentage >= 80) {
                // Aim higher
                if (currentIdx < diffLevels.length - 1) targetDiff = diffLevels[currentIdx + 1];
            } else if (result.percentage < 50) {
                // Aim lower or easy
                if (currentIdx > 0) targetDiff = diffLevels[currentIdx - 1];
                else targetDiff = "BEGINNER";
            }

            if (targetDiff) {
                const recommended = quizzes.find(q =>
                    q.difficulty?.toUpperCase() === targetDiff &&
                    q.status !== 'ATTEMPTED' &&
                    Number(q.quiz_id) !== Number(quizId)
                );
                if (recommended) {
                    setSuggestion(recommended);
                }
            }
        }
    }, [result, quizzes, quizId]);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Syncing Quiz Data...</Typography>
        </Box>
    );

    if (showChoice && !showSimpleResult) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
                    <Paper sx={{ p: 6, borderRadius: '32px', boxShadow: '0 20px 50px -10px rgba(99, 102, 241, 0.1)', bgcolor: 'white' }}>
                        <TrophyIcon sx={{ fontSize: 80, color: '#fbbf24', mb: 3 }} />
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.02em', color: '#1e293b' }}>
                            Congratulations!
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b', mb: 5, fontSize: '1.1rem' }}>
                            You have successfully completed the <b>{quiz?.title || 'quiz'}</b>. What would you like to see first?
                        </Typography>

                        <Stack spacing={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => setShowSimpleResult(true)}
                                sx={{
                                    py: 2.5,
                                    borderRadius: '20px',
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                    bgcolor: '#6366f1',
                                    textTransform: 'none',
                                    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                                    '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-2px)' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                View Quick Score
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate(`/student/quiz/${quizId}/result`)}
                                sx={{
                                    py: 2.5,
                                    borderRadius: '20px',
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                    borderColor: '#1e293b',
                                    color: '#1e293b',
                                    textTransform: 'none',
                                    borderWidth: 2,
                                    '&:hover': { borderWidth: 2, bgcolor: 'rgba(30, 41, 59, 0.05)', borderColor: '#0f172a' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                View Detailed Summary & Print
                            </Button>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        );
    }

    if (result || showSimpleResult) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }}>
                <Box sx={{ maxWidth: 700, mx: 'auto' }}>
                    {isTimerFinished && (
                        <Alert
                            severity="error"
                            variant="filled"
                            icon={<TimerIcon />}
                            sx={{
                                mb: 3,
                                borderRadius: '16px',
                                fontWeight: 700,
                                boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.4)',
                                animation: 'shake 0.5s ease-in-out'
                            }}
                        >
                            Time's Up! Your answers are being submitted automatically. Please wait...
                        </Alert>
                    )}

                    <Paper sx={{
                        p: 6, borderRadius: '32px', textAlign: 'center', boxShadow: '0 20px 50px -10px rgba(99, 102, 241, 0.1)', mb: 4, position: 'relative', overflow: 'hidden'
                    }}>
                        <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(99, 102, 241, 0.03)' }} />

                        <TrophyIcon sx={{ fontSize: 80, color: '#fbbf24', mb: 2 }} />
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>Quiz Complete!</Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>Your score has been securely calculated by the server.</Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 4, md: 8 }, my: 5 }}>
                            <Box>
                                <Typography variant="h2" sx={{ fontWeight: 900, color: '#1e293b' }}>{result.score}</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', letterSpacing: '0.1em' }}>TOTAL SCORE</Typography>
                            </Box>
                            <Box sx={{ width: '2px', height: '60px', bgcolor: '#e2e8f0' }} />
                            <Box>
                                <Typography variant="h2" sx={{ fontWeight: 900, color: '#6366f1' }}>{result.percentage}%</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', letterSpacing: '0.1em' }}>ACCURACY</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ px: 4 }}>
                            <LinearProgress
                                variant="determinate"
                                value={result.percentage}
                                sx={{ height: 12, borderRadius: 6, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { borderRadius: 6, bgcolor: result.percentage >= 50 ? '#10b981' : '#f43f5e' } }}
                            />
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 6, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/student/quiz/${quizId}/result`)}
                                sx={{
                                    px: 4, py: 1.5, borderRadius: '16px', fontWeight: 800,
                                    bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' },
                                    textTransform: 'none'
                                }}
                            >
                                View Detailed Summary & Print
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/student/quizzes')}
                                sx={{
                                    px: 4, py: 1.5, borderRadius: '16px', fontWeight: 800,
                                    borderColor: '#1e293b', color: '#1e293b',
                                    '&:hover': { borderColor: '#0f172a', bgcolor: 'rgba(30,41,59,0.05)' },
                                    textTransform: 'none'
                                }}
                            >
                                Return to Dashboard
                            </Button>
                        </Stack>
                    </Paper>

                    <Alert severity="info" sx={{ borderRadius: '16px', bgcolor: 'rgba(99, 102, 241, 0.05)', color: '#4f46e5', border: '1px solid rgba(99, 102, 241, 0.1)', mb: 3 }}>
                        <AlertTitle sx={{ fontWeight: 800 }}>Server-Side Verified</AlertTitle>
                        Scores are calculated and hashed on the server for security. Detailed question review is enabled after the instructor releases final results.
                    </Alert>

                    {/* Suggestions / Next Path Section */}
                    {result && (
                        <Box sx={{ mt: 2 }}>
                            {result.percentage >= 80 ? (
                                <Alert
                                    severity="success"
                                    icon={<TrophyIcon fontSize="inherit" />}
                                    sx={{ borderRadius: '16px', textAlign: 'left', border: '1px solid rgba(16, 185, 129, 0.1)', mb: 2 }}
                                >
                                    <AlertTitle sx={{ fontWeight: 800 }}>Mastery Achieved! 🚀</AlertTitle>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Outstanding work! You've demonstrated a deep understanding of the core concepts in this quiz.
                                        <b> What's next?</b> We recommend challenging yourself with advanced topics or tackling more difficult quizzes in the catalog.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="success"
                                        onClick={() => navigate('/student/quizzes')}
                                        sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                                    >
                                        Explore Advanced Quizzes
                                    </Button>
                                </Alert>
                            ) : result.percentage >= 50 ? (
                                <Alert
                                    severity="info"
                                    sx={{ borderRadius: '16px', textAlign: 'left', border: '1px solid rgba(2, 132, 199, 0.1)', mb: 2 }}
                                >
                                    <AlertTitle sx={{ fontWeight: 800 }}>Well Done! 📈</AlertTitle>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Great effort! You've secured a passing grade and showed solid progress.
                                        <b> What's next?</b> Review the few areas that were tricky to achieve full mastery. You might want to try another quiz of similar difficulty to solidify these gains.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => navigate('/student/quizzes')}
                                        sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none', bgcolor: '#0284c7' }}
                                    >
                                        Try Similar Quizzes
                                    </Button>
                                </Alert>
                            ) : (
                                <Alert
                                    severity="warning"
                                    sx={{ borderRadius: '16px', textAlign: 'left', border: '1px solid rgba(245, 158, 11, 0.1)', mb: 2 }}
                                >
                                    <AlertTitle sx={{ fontWeight: 800 }}>Learning Opportunity 📚</AlertTitle>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Don't be discouraged! Every expert started as a beginner.
                                        <b> What's next?</b> We highly recommend <b>revisiting the course materials</b> for this topic. Strengthening your foundations will make the next attempt much smoother.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="warning"
                                        onClick={() => navigate(`/student/course/${quiz?.course_id || ''}`)}
                                        sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
                                    >
                                        Review Materials
                                    </Button>
                                </Alert>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {isTimerFinished && (
                    <Alert
                        severity="error"
                        variant="filled"
                        icon={<TimerIcon />}
                        sx={{
                            mb: 3,
                            borderRadius: '16px',
                            fontWeight: 700,
                            boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.4)',
                            animation: 'shake 0.5s ease-in-out',
                            '@keyframes shake': {
                                '0%, 100%': { transform: 'translateX(0)' },
                                '25%': { transform: 'translateX(-5px)' },
                                '75%': { transform: 'translateX(5px)' }
                            }
                        }}
                    >
                        Time's Up! Your answers are being submitted automatically. Please wait...
                    </Alert>
                )}

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>{quiz?.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>{quiz?.topic}</Typography>
                    </Box>

                    {/* Enhanced Premium Timer UI */}
                    <Box sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2.5,
                        py: 1,
                        borderRadius: '20px',
                        background: timeLeft < 60
                            ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        border: '1px solid',
                        borderColor: timeLeft < 60 ? '#fecaca' : '#e2e8f0',
                        boxShadow: timeLeft < 60
                            ? '0 4px 12px rgba(239, 68, 68, 0.1)'
                            : '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        transition: 'all 0.3s ease'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: timeLeft < 60 ? '#ef4444' : '#6366f1',
                            animation: timeLeft < 60 ? 'pulse 1s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)', opacity: 1 },
                                '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                                '100%': { transform: 'scale(1)', opacity: 1 }
                            }
                        }}>
                            <TimerIcon sx={{ fontSize: 24 }} />
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{
                                display: 'block',
                                lineHeight: 1,
                                fontWeight: 700,
                                color: '#64748b',
                                textTransform: 'uppercase',
                                fontSize: '0.65rem',
                                mb: 0.5
                            }}>
                                Time Remaining
                            </Typography>
                            <Typography sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 900,
                                fontSize: '1.25rem',
                                color: timeLeft < 60 ? '#ef4444' : '#1e293b',
                                lineHeight: 1
                            }}>
                                {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                            </Typography>
                        </Box>
                    </Box>

                    <Chip
                        label={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
                        sx={{ fontWeight: 800, bgcolor: '#6366f1', color: 'white', px: 1 }}
                    />
                </Box>

                {/* Progress Bar */}
                <LinearProgress
                    variant="determinate"
                    value={((currentQuestionIndex + 1) / questions.length) * 100}
                    sx={{ mb: 5, height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }}
                />

                {/* Question Card */}
                <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: '32px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.03)', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 5, lineHeight: 1.3 }}>
                        {currentQuestion.questionText}
                    </Typography>

                    <Box>
                        {(currentQuestion.type === 'LONG' || currentQuestion.type === 'SHORT') ? (
                            <TextField
                                multiline
                                rows={6}
                                fullWidth
                                variant="outlined"
                                placeholder="Type your answer here..."
                                value={answers[currentQuestion.questionId] || ''}
                                onChange={handleOptionChange}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 4,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 4,
                                        '& fieldset': { borderColor: '#e2e8f0', borderWidth: 2 },
                                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                                        '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                                    }
                                }}
                            />
                        ) : (
                            <RadioGroup
                                value={answers[currentQuestion.questionId] !== undefined ? answers[currentQuestion.questionId] : ''}
                                onChange={handleOptionChange}
                                sx={{ gap: 2 }}
                            >
                                {currentQuestion.options_array.map((option, idx) => {
                                    const isSelected = answers[currentQuestion.questionId] === idx;
                                    return (
                                        <FormControlLabel
                                            key={idx}
                                            value={idx}
                                            control={<Radio sx={{ display: 'none' }} />}
                                            label={
                                                <Box sx={{
                                                    p: 2.5, px: 3, borderRadius: '20px', border: '2px solid',
                                                    borderColor: isSelected ? '#6366f1' : '#f1f5f9',
                                                    bgcolor: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': { borderColor: isSelected ? '#6366f1' : '#cbd5e1', cursor: 'pointer' }
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{
                                                            width: 28, height: 28, borderRadius: '50%', border: '2px solid',
                                                            borderColor: isSelected ? '#6366f1' : '#cbd5e1',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            bgcolor: isSelected ? '#6366f1' : 'transparent'
                                                        }}>
                                                            {isSelected && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'white' }} />}
                                                        </Box>
                                                        <Typography sx={{ fontWeight: isSelected ? 800 : 500, color: isSelected ? '#1e293b' : '#64748b' }}>
                                                            {option}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            }
                                            sx={{ m: 0, width: '100%' }}
                                        />
                                    );
                                })}
                            </RadioGroup>
                        )}
                    </Box>
                </Paper>

                {/* Footer Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        disabled={currentQuestionIndex === 0}
                        onClick={handlePrevious}
                        startIcon={<PrevIcon />}
                        sx={{ px: 3, fontWeight: 700, borderRadius: '12px', color: '#64748b' }}
                    >
                        Previous
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                            variant="contained"
                            disabled={submitting || answers[currentQuestion.questionId] === undefined}
                            onClick={handleSubmit}
                            sx={{ px: 6, py: 1.5, borderRadius: '16px', fontWeight: 800, bgcolor: '#6366f1', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)', '&:hover': { bgcolor: '#4f46e5' } }}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Finish & Submit'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            disabled={answers[currentQuestion.questionId] === undefined}
                            onClick={handleNext}
                            endIcon={<NextIcon />}
                            sx={{ px: 4, py: 1.5, borderRadius: '16px', fontWeight: 800, bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' } }}
                        >
                            Next Question
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default QuizAttempt;
