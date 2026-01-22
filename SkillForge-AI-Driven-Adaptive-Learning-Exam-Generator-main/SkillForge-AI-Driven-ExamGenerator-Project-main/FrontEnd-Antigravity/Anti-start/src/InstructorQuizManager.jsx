import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid, Chip, IconButton,
    Divider, Stack, List, ListItem, ListItemText, Checkbox,
    Avatar, Tab, Tabs, Card, CardContent, CircularProgress,
    Fade, InputAdornment, Tooltip, Alert, Container, MenuItem, alpha,
    ListItemButton
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Quiz as QuizIcon,
    AutoAwesome as AutoAwesomeIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    CheckCircle as CheckCircleIcon,
    Save as SaveIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from './services/quizService';
import { courseService } from './services/courseService';
import { aiService } from './services/aiService';

const InstructorQuizManager = () => {
    const { courseId, topicId, quizId } = useParams();
    const navigate = useNavigate();

    // ------------------- STATES -------------------
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [mode, setMode] = useState('MANUAL'); // 'AI' or 'MANUAL'
    const [students, setStudents] = useState([]);
    const [searchStudent, setSearchStudent] = useState("");
    const [courseTitle, setCourseTitle] = useState("");

    const [quizData, setQuizData] = useState({
        quizId: '', // Manual Quiz ID as requested
        title: '',
        difficulty: 'MEDIUM',
        totalMarks: 100,
        timeLimit: 30, // Default 30 minutes
        topicId: Number(topicId),
        questionType: 'MCQ' // ⚡ Added to track quiz-level type
    });

    const [aiParams, setAiParams] = useState({
        numQuestions: 5,
        numMcq: 3,
        numLong: 2,
        difficulty: 'MEDIUM',
        topicId: Number(topicId),
        topicName: '',
        questionType: 'MCQ'
    });

    const [generating, setGenerating] = useState(false);

    const [allTopics, setAllTopics] = useState([]);
    const [existingQuizzes, setExistingQuizzes] = useState([]);
    const [editingQuizId, setEditingQuizId] = useState(null); // When editing, we store the DB ID

    // Questions list
    const [questions, setQuestions] = useState([
        { questionId: '1', questionText: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: 'A' }
    ]);

    // Selected students (full objects)
    const [selectedStudents, setSelectedStudents] = useState([]);

    // ------------------- HYDRATION -------------------
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Fetch students
                const studentsList = await quizService.getRegisteredStudents();
                setStudents(studentsList || []);

                // Fetch course info to show topic name/course name
                const courses = await courseService.getCourses();
                const currentCourse = courses.find(c => c.course_id === courseId);
                if (currentCourse) {
                    setCourseTitle(currentCourse.course_title);
                    setAllTopics(currentCourse.topics || []);

                    // Set default topic name for AI
                    const currentTopic = (currentCourse.topics || []).find(t => t.id === Number(topicId));
                    if (currentTopic) {
                        setAiParams(prev => ({ ...prev, topicName: currentTopic.name }));
                        setQuizData(prev => ({ ...prev, title: `${currentTopic.name} Quiz` }));
                    }
                }

                // Fetch existing quizzes for this topic
                const allQuizzes = await quizService.getAllQuizzes();
                const topicQuizzes = allQuizzes.filter(q => q.topicId === Number(topicId));
                setExistingQuizzes(topicQuizzes);

                // HANDLE EDIT MODE VIA URL

                if (quizId) {
                    console.log("✏️ Edit mode detected for Quiz ID:", quizId);

                    try {
                        const fullQuizDetails = await quizService.getQuizDetails(quizId);
                        if (fullQuizDetails) {
                            console.log("✅ Full quiz details loaded:", fullQuizDetails);
                            handleEditExisting(fullQuizDetails, studentsList);
                        } else {
                            setMessage({ type: 'error', text: 'Quiz details not found.' });
                        }
                    } catch (e) {
                        console.error("❌ Failed to load quiz details", e);
                        setMessage({ type: 'error', text: 'Error loading quiz for editing.' });
                    }
                }

            } catch (err) {
                console.error("Failed to load initial data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [courseId, topicId, quizId]);

    // ------------------- HELPERS -------------------
    const computeQuizType = (qs) => {
        if (!qs || qs.length === 0) return "MCQ";
        const types = new Set(qs.map(q => (q.type || 'MCQ').toUpperCase()));
        if (types.size === 1) return [...types][0];
        return "MIXED";
    };

    // ------------------- HANDLERS -------------------
    const handleAiGenerate = async () => {
        console.log("\n🚀 ========== AI GENERATION STARTED ==========");
        console.log("📋 Current AI Parameters:", aiParams);
        console.log("  - Topic ID:", aiParams.topicId);
        console.log("  - Topic Name:", aiParams.topicName);
        console.log("  - Number of Questions:", aiParams.numQuestions);
        console.log("  - Difficulty:", aiParams.difficulty);
        console.log("  - Question Type:", aiParams.questionType);

        setGenerating(true);
        setMessage({ type: 'info', text: 'Connecting to AI service... This may take a few moments.' });

        try {
            const topic = allTopics.find(t => t.id === aiParams.topicId);
            console.log("🔍 Found Topic:", topic);

            const requestParams = {
                ...aiParams,
                topicName: topic ? topic.name : aiParams.topicName
            };
            console.log("📤 Calling aiService.generateQuestions with:", requestParams);

            setMessage({ type: 'info', text: 'AI is generating questions... Please wait.' });

            const genQuestions = await aiService.generateQuestions(requestParams);

            console.log("✅ AI Service returned questions:", genQuestions);
            console.log("  - Number of questions received:", genQuestions?.length || 0);

            if (!genQuestions || genQuestions.length === 0) {
                throw new Error('No questions were generated. Please try again.');
            }

            // Check if we got real AI questions or samples
            const hasRealQuestions = genQuestions.some(q =>
                q.question && !q.question.toLowerCase().includes('sample')
            );

            if (!hasRealQuestions) {
                setMessage({
                    type: 'warning',
                    text: 'AI service returned sample questions. Check your API key and internet connection.'
                });
            } else {
                setMessage({
                    type: 'success',
                    text: `🎉 AI successfully generated ${genQuestions.length} real questions! Review and edit them below.`
                });
            }

            console.log("🔧 Setting questions directly from AI service");
            setQuestions(genQuestions);
            console.log("💾 Questions state updated");

            // Sync quizData with AI params & Compute Type
            const computedType = computeQuizType(genQuestions);
            const updatedQuizData = {
                ...quizData,
                difficulty: aiParams.difficulty,
                topicId: aiParams.topicId,
                questionType: computedType
            };
            setQuizData(updatedQuizData);
            console.log("💾 Quiz data synced with AI params:", updatedQuizData);

            console.log("✅ ========== AI GENERATION COMPLETED ==========\n");

        } catch (err) {
            console.error("❌ ========== AI GENERATION FAILED ==========");
            console.error("Error object:", err);
            console.error("Error message:", err.message);
            console.error("Error response:", err.response);
            console.error("Error stack:", err.stack);

            // Show specific error message
            let errorMessage = 'Failed to generate questions. ';

            if (err.message.includes('AI generation failed')) {
                errorMessage += 'Please check your internet connection and API key configuration.';
            } else if (err.message.includes('No questions were generated')) {
                errorMessage += 'The AI service did not return any questions. Please try again.';
            } else {
                errorMessage += err.message || 'Unknown error occurred.';
            }

            setMessage({ type: 'error', text: errorMessage });
            console.log("❌ ========== AI GENERATION ERROR END ==========\n");
        } finally {
            setGenerating(false);
        }
    };

    const handleEditExisting = (quiz, studentsList = []) => {
        setEditingQuizId(quiz.id || quiz.quizId);
        setQuizData({
            quizId: quiz.quizId || '',
            title: quiz.title || '',
            difficulty: quiz.difficulty || 'MEDIUM',
            totalMarks: quiz.totalMarks || 100,
            timeLimit: quiz.timeLimit || 30,
            topicId: (quiz.topicId || quiz.topicId === 0) ? Number(quiz.topicId) : ""
        });

        // Normalize questions
        const normalizedQuestions = (quiz.questions || []).map(q => {
            const type = (q.questionType || q.type || 'MCQ').toUpperCase();
            return {
                ...q,
                questionId: q.questionId || '',
                questionText: q.questionText || q.question || '',
                type: type,
                options: Array.isArray(q.options) ? q.options : (q.options_array || ['', '', '', '']),
                correctAnswer: ["A", "B", "C", "D"].includes(q.correctAnswer) ? q.correctAnswer : "A"
            };
        });

        const computedType = computeQuizType(normalizedQuestions);
        setQuizData(prev => ({ ...prev, questionType: computedType }));
        setQuestions(normalizedQuestions);

        // Hydrate selected students
        const currentStudents = studentsList.length > 0 ? studentsList : students;
        if (quiz.assignedStudentIds && currentStudents.length > 0) {
            const assignedIds = quiz.assignedStudentIds.map(id => Number(id));
            const matched = currentStudents.filter(s => assignedIds.includes(Number(s.studentId || s.id)));
            console.log("👥 Matched students for edit:", matched);
            setSelectedStudents(matched);
        }

        setMode('MANUAL');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMessage({ type: 'info', text: `Editing Quiz: ${quiz.title}` });
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await quizService.deleteQuiz(id);
            setExistingQuizzes(prev => prev.filter(q => (q.id !== id && q.quizId !== id)));
            setMessage({ type: 'success', text: 'Quiz deleted successfully.' });
        } catch (err) {
            console.error("Delete failed:", err);
            setMessage({ type: 'error', text: 'Failed to delete quiz.' });
        }
    };
    const handleAddQuestion = () => {
        const nextId = questions.length > 0 ? (Number(questions[questions.length - 1].questionId) + 1).toString() : '1';
        setQuestions([...questions, { questionId: nextId, questionText: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: 'A' }]);
    };

    const handleRemoveQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleQuestionIdChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].questionId = value;
        setQuestions(newQuestions);
    };

    const handleQuestionTextChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswer = value;
        setQuestions(newQuestions);
    };

    const toggleStudent = (student) => {
        console.log("Student object:", student);
        console.log("Student ID:", student.studentId);

        setSelectedStudents(prev =>
            prev.some(s => s.studentId === student.studentId)
                ? prev.filter(s => s.studentId !== student.studentId)
                : [...prev, student]
        );
    };

    const handleSubmit = async () => {
        console.log("\n💾 ========== QUIZ SUBMISSION STARTED ==========");
        console.log("📋 Current Mode:", mode);
        console.log("📋 Editing Quiz ID:", editingQuizId);
        console.log("📋 Quiz Data:", quizData);
        console.log("📋 Questions Count:", questions.length);
        console.log("📋 Selected Students Count:", selectedStudents.length);

        // Validation
        console.log("🔍 Starting validation...");
        console.log("  - Quiz Title:", quizData.title);

        const invalidQuestions = [];
        questions.forEach((q, idx) => {
            const issues = [];
            const type = (q.type || 'MCQ').toUpperCase();

            // Common validation
            if (!q.questionText || !q.questionText.trim()) {
                issues.push("missing question text");
            }

            // MCQ-specific validation
            if (type === 'MCQ') {
                if (!q.options || !Array.isArray(q.options) || q.options.filter(opt => opt && opt.trim()).length < 2) {
                    issues.push("MCQ requires at least 2 non-empty options");
                }
                if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer.toUpperCase())) {
                    issues.push("MCQ requires a valid correct answer (A, B, C, or D)");
                }
            }
            // LONG/SHORT validation (currently just needs questionText, which is checked above)

            if (issues.length > 0) {
                invalidQuestions.push({ index: idx + 1, questionId: q.questionId, issues });
            }
        });

        if (!quizData.title || !quizData.title.trim()) {
            console.warn("⚠️ Validation failed: Quiz title is missing");
            setMessage({ type: 'error', text: 'Please provide a quiz title.' });
            return;
        }

        if (invalidQuestions.length > 0) {
            console.warn("⚠️ Validation failed: Some questions have missing fields", invalidQuestions);
            const firstError = invalidQuestions[0];
            setMessage({
                type: 'error',
                text: `Question ${firstError.index}: ${firstError.issues.join(', ')}`
            });
            return;
        }

        if (selectedStudents.length === 0) {
            console.warn("⚠️ Validation failed: No students selected");
            setMessage({ type: 'warning', text: 'Please assign the quiz to at least one student.' });
            return;
        }

        console.log("✅ Validation passed");

        setSubmitting(true);
        try {
            const assignedStudentIds = selectedStudents.map(s => s.studentId);
            const quizType = computeQuizType(questions);

            // Remove manual quizId field from the payload
            const { quizId, ...cleanQuizData } = quizData;

            const payload = {
                ...cleanQuizData,
                questionType: quizType, // ✅ FIXED
                questions: questions.map(q => {
                    const type = (q.type || 'MCQ').toUpperCase();
                    if (type === 'MCQ') {
                        return {
                            ...q,
                            type: 'MCQ',
                            correctAnswer: q.correctAnswer.toUpperCase()
                        };
                    } else {
                        // For non-MCQ, ensure options is empty
                        return {
                            ...q,
                            type: type,
                            options: [],
                            correctAnswer: q.correctAnswer || '' // Might be empty for AI gen
                        };
                    }
                }),
                assignedStudentIds: assignedStudentIds
            };

            console.log("\n📦 ========== FINAL PAYLOAD ==========");
            console.log("Full Payload:", JSON.stringify(payload, null, 2));
            console.log("  - Quiz ID:", payload.quizId);
            console.log("  - Title:", payload.title);
            console.log("  - Difficulty:", payload.difficulty);
            console.log("  - Total Marks:", payload.totalMarks);
            console.log("  - Time Limit:", payload.timeLimit);
            console.log("  - Topic ID:", payload.topicId);
            console.log("  - Questions Count:", payload.questions.length);
            console.log("  - Assigned Students:", payload.assignedStudentIds);
            console.log("  - Questions Detail:");
            payload.questions.forEach((q, idx) => {
                console.log(`    Question ${idx + 1}:`, {
                    questionId: q.questionId,
                    questionText: q.questionText?.substring(0, 50) + "...",
                    options: q.options,
                    correctAnswer: q.correctAnswer
                });
            });
            console.log("======================================\n");

            if (editingQuizId) {
                console.log("🔄 Updating existing quiz with ID:", editingQuizId);
                await quizService.updateQuiz(editingQuizId, payload);
                console.log("✅ Quiz updated successfully");
                setMessage({ type: 'success', text: 'Quiz updated successfully!' });
            } else if (mode === 'AI') {
                console.log("🤖 Creating AI-generated quiz");
                console.log("📤 Calling aiService.saveAiQuiz...");
                const response = await aiService.saveAiQuiz(payload);
                console.log("✅ AI Quiz saved successfully. Response:", response);
                setMessage({ type: 'success', text: 'AI Quiz created and assigned successfully!' });
            } else {
                console.log("✍️ Creating manual quiz");
                console.log("📤 Calling quizService.createAndAssignQuiz...");
                const response = await quizService.createAndAssignQuiz(payload);
                console.log("✅ Manual Quiz created successfully. Response:", response);
                setMessage({ type: 'success', text: 'Manual Quiz created and assigned successfully!' });
            }

            console.log("✅ ========== QUIZ SUBMISSION COMPLETED ==========\n");
            // Navigate back after delay
            setTimeout(() => navigate(-1), 2000);
        } catch (err) {
            console.error("\n❌ ========== QUIZ SUBMISSION FAILED ==========");
            console.error("Error object:", err);
            console.error("Error message:", err.message);
            console.error("Error response status:", err.response?.status);
            console.error("Error response data:", err.response?.data);
            console.error("Error stack:", err.stack);
            setMessage({ type: 'error', text: 'Failed to create quiz. Ensure backend endpoint /api/instructor/quiz/create is active.' });
            console.log("❌ ========== SUBMISSION ERROR END ==========\n");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Loading Management Tools...</Typography>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: { xs: 2, md: 6 } }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                    <Box display="flex" alignItems="center" gap={3}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:hover': { bgcolor: '#f1f5f9' } }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 0.5, background: 'linear-gradient(45deg, #1e293b, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {editingQuizId ? 'Edit Quiz' : 'Quiz Designer'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                                {courseTitle} • <Box component="span" sx={{ color: 'primary.main' }}>Topic #{topicId}</Box>
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={2}>
                        {editingQuizId && (
                            <Button variant="outlined" onClick={() => { setEditingQuizId(null); setQuestions([{ questionId: '1', questionText: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: 'A' }]); }} sx={{ borderRadius: '16px', fontWeight: 700 }}>
                                Cancel Edit
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={submitting}
                            onClick={handleSubmit}
                            sx={{
                                px: 4, py: 1.5, borderRadius: '16px', fontWeight: 800,
                                bgcolor: '#1e293b', boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
                                '&:hover': { bgcolor: '#0f172a', transform: 'translateY(-2px)' },
                                transition: 'all 0.2s'
                            }}
                        >
                            {editingQuizId ? 'Update Quiz' : 'Save & Assign Quiz'}
                        </Button>
                    </Box>
                </Box>

                {message && (
                    <Fade in>
                        <Alert severity={message.type} sx={{ mb: 4, borderRadius: '16px', fontWeight: 600 }}>
                            {message.text}
                        </Alert>
                    </Fade>
                )}

                <Grid container spacing={4}>
                    {/* LEFT PANEL: CONFIGURATION */}
                    <Grid item xs={12} md={8}>
                        <Stack spacing={4}>
                            {/* STEP 1: CHOOSE MODE */}
                            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>1. Select Creation Mode</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Card
                                            onClick={() => setMode('AI')}
                                            sx={{
                                                cursor: 'pointer', border: '2px solid',
                                                borderColor: mode === 'AI' ? 'primary.main' : 'divider',
                                                bgcolor: mode === 'AI' ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                                transition: 'all 0.2s', position: 'relative'
                                            }}
                                        >
                                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                                {generating ? (
                                                    <CircularProgress size={40} sx={{ mb: 2 }} />
                                                ) : (
                                                    <AutoAwesomeIcon sx={{ fontSize: 40, color: mode === 'AI' ? 'primary.main' : 'text.disabled', mb: 2 }} />
                                                )}
                                                <Typography fontWeight="800">Generate with AI</Typography>
                                                <Typography variant="caption" color="textSecondary">Create questions instantly</Typography>
                                                <Chip label="AVAILABLE" color="success" size="small" sx={{ position: 'absolute', top: 12, right: 12, fontSize: '0.65rem', fontWeight: 900 }} />
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card
                                            onClick={() => setMode('MANUAL')}
                                            sx={{
                                                cursor: 'pointer', border: '2px solid',
                                                borderColor: mode === 'MANUAL' ? 'primary.main' : 'divider',
                                                bgcolor: mode === 'MANUAL' ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                                transition: 'all 0.2s', borderRadius: '20px',
                                                '&:hover': { borderColor: 'primary.light', transform: 'translateY(-2px)' }
                                            }}
                                        >
                                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                                <QuizIcon sx={{ fontSize: 40, color: mode === 'MANUAL' ? 'primary.main' : 'text.disabled', mb: 2 }} />
                                                <Typography fontWeight="800">Manual Entry</Typography>
                                                <Typography variant="caption" color="textSecondary">Craft specific assessments</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Paper>



                            {/* STEP 2: QUIZ DETAILS */}
                            <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>2. Quiz Information</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth select label="Select Topic"
                                            value={quizData.topicId ?? ""}
                                            onChange={(e) => setQuizData({ ...quizData, topicId: Number(e.target.value) })}
                                        >
                                            {allTopics.map((t) => (
                                                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth label="Total Marks" type="number"
                                            value={quizData.totalMarks}
                                            onChange={(e) => setQuizData({ ...quizData, totalMarks: Number(e.target.value) })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth label="Time Limit (Mins)" type="number"
                                            value={quizData.timeLimit}
                                            onChange={(e) => setQuizData({ ...quizData, timeLimit: Number(e.target.value) })}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">min</InputAdornment>
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth label="Quiz Title" placeholder="e.g. React Hooks Fundamentals"
                                            value={quizData.title}
                                            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" fontWeight="800" sx={{ mb: 1, display: 'block' }}>DIFFICULTY</Typography>
                                        <Stack direction="row" spacing={1}>
                                            {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(d => (
                                                <Chip
                                                    key={d} label={d}
                                                    onClick={() => setQuizData({ ...quizData, difficulty: d })}
                                                    variant={quizData.difficulty === d ? 'filled' : 'outlined'}
                                                    color={quizData.difficulty === d ? 'primary' : 'default'}
                                                    sx={{ fontWeight: 700, px: 1 }}
                                                />
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {mode === 'AI' && (
                                <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                                        <AutoAwesomeIcon sx={{ color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>AI Generation Settings</Typography>
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth select label="Target Topic"
                                                value={aiParams.topicId}
                                                onChange={(e) => {
                                                    const tid = Number(e.target.value);
                                                    const t = allTopics.find(x => x.id === tid);
                                                    setAiParams({ ...aiParams, topicId: tid, topicName: t ? t.name : '' });
                                                }}
                                            >
                                                {allTopics.map((t) => (
                                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth select label="Question Type"
                                                value={aiParams.questionType || 'MCQ'}
                                                onChange={(e) => {
                                                    const type = e.target.value;
                                                    setAiParams({
                                                        ...aiParams,
                                                        questionType: type,
                                                        numQuestions: type === 'MIXED' ? aiParams.numMcq + aiParams.numLong : aiParams.numQuestions
                                                    });
                                                }}
                                            >
                                                <MenuItem value="MCQ">Multiple Choice Only</MenuItem>
                                                <MenuItem value="LONG">Long Answer Only</MenuItem>
                                                <MenuItem value="SHORT">Short Answer Only</MenuItem>
                                                <MenuItem value="MIXED">Mixed (MCQ + Long)</MenuItem>
                                            </TextField>
                                        </Grid>

                                        {aiParams.questionType === 'MIXED' ? (
                                            <>
                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        fullWidth label="MCQ Count" type="number"
                                                        value={aiParams.numMcq}
                                                        onChange={(e) => {
                                                            const mcq = Number(e.target.value);
                                                            setAiParams({
                                                                ...aiParams,
                                                                numMcq: mcq,
                                                                numQuestions: mcq + aiParams.numLong
                                                            });
                                                        }}
                                                        inputProps={{ min: 0, max: 20 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        fullWidth label="Long Answer Count" type="number"
                                                        value={aiParams.numLong}
                                                        onChange={(e) => {
                                                            const long = Number(e.target.value);
                                                            setAiParams({
                                                                ...aiParams,
                                                                numLong: long,
                                                                numQuestions: aiParams.numMcq + long
                                                            });
                                                        }}
                                                        inputProps={{ min: 0, max: 20 }}
                                                    />
                                                </Grid>
                                            </>
                                        ) : (
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth label="Number of Questions" type="number"
                                                    value={aiParams.numQuestions}
                                                    onChange={(e) => setAiParams({ ...aiParams, numQuestions: Number(e.target.value) })}
                                                    inputProps={{ min: 1, max: 50 }}
                                                />
                                            </Grid>
                                        )}
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="caption" fontWeight="800" sx={{ mb: 1, display: 'block' }}>DIFFICULTY LEVEL</Typography>
                                            <Stack direction="row" spacing={1}>
                                                {['EASY', 'MEDIUM', 'DIFFICULT'].map(d => (
                                                    <Chip
                                                        key={d} label={d}
                                                        onClick={() => setAiParams({ ...aiParams, difficulty: d })}
                                                        variant={aiParams.difficulty === d ? 'filled' : 'outlined'}
                                                        color={aiParams.difficulty === d ? 'primary' : 'default'}
                                                        sx={{ fontWeight: 700, px: 2 }}
                                                    />
                                                ))}
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                                                onClick={handleAiGenerate}
                                                disabled={generating}
                                                sx={{
                                                    px: 6, py: 2, borderRadius: '20px',
                                                    background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
                                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                                    fontWeight: 800, mr: 2
                                                }}
                                            >
                                                {generating ? 'Engine Calibrating...' : 'Generate Magic Quiz'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch('http://localhost:8081/api/test/gemini');
                                                        const result = await response.json();
                                                        setMessage({
                                                            type: result.status === 'SUCCESS' ? 'success' : 'error',
                                                            text: result.message
                                                        });
                                                    } catch (err) {
                                                        setMessage({ type: 'error', text: 'Failed to test API connection' });
                                                    }
                                                }}
                                                sx={{ fontWeight: 600 }}
                                            >
                                                Test API
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            )}

                            {/* ALWAYS SHOW QUESTIONS IF THEY EXIST (AI or MANUAL) */}
                            {questions.length > 0 && questions.some(q => q.questionText && q.questionText.trim()) && (
                                <Box>
                                    <Divider sx={{ my: 4 }}>
                                        <Chip label="REVIEW & EDIT QUESTIONS" sx={{ fontWeight: 800, bgcolor: '#f1f5f9' }} />
                                    </Divider>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>3. Questions List ({questions.length} questions)</Typography>
                                        <Box display="flex" gap={1}>
                                            <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddQuestion} size="small">
                                                Add Question
                                            </Button>
                                            <Button
                                                startIcon={<DeleteIcon />}
                                                variant="outlined"
                                                color="error"
                                                onClick={() => {
                                                    if (window.confirm('Clear all questions?')) {
                                                        setQuestions([{ questionId: '1', questionText: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: 'A' }]);
                                                    }
                                                }}
                                                size="small"
                                            >
                                                Clear All
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Stack spacing={3}>
                                        {questions.map((q, idx) => (
                                            <Paper key={idx} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', position: 'relative', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' } }}>
                                                <IconButton
                                                    onClick={() => handleRemoveQuestion(idx)}
                                                    sx={{ position: 'absolute', top: 16, right: 16, color: 'error.light', bgcolor: alpha('#f43f5e', 0.05) }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                                <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800, mb: 2 }}>QUESTION #{(idx + 1).toString().padStart(2, '0')}</Typography>

                                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                                    <Grid item xs={12} md={2}>
                                                        <TextField
                                                            fullWidth label="ID" placeholder="ID"
                                                            value={q.questionId}
                                                            onChange={(e) => handleQuestionIdChange(idx, e.target.value)}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">#</InputAdornment>
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <TextField
                                                            fullWidth select label="Question Type"
                                                            value={q.type || 'MCQ'}
                                                            onChange={(e) => {
                                                                const newQ = [...questions];
                                                                newQ[idx].type = e.target.value;
                                                                setQuestions(newQ);
                                                            }}
                                                        >
                                                            <MenuItem value="MCQ">Multiple Choice</MenuItem>
                                                            <MenuItem value="LONG">Long Answer</MenuItem>
                                                            <MenuItem value="SHORT">Short Answer</MenuItem>
                                                        </TextField>
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth label="Question Text"
                                                            value={q.questionText}
                                                            onChange={(e) => handleQuestionTextChange(idx, e.target.value)}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                {(q.type === 'MCQ' || !q.type) && (
                                                    <>
                                                        <Grid container spacing={2}>
                                                            {['A', 'B', 'C', 'D'].map((opt, oIdx) => (
                                                                <Grid item xs={12} md={6} key={opt}>
                                                                    <TextField
                                                                        fullWidth size="small" label={`Option ${opt}`}
                                                                        value={q.options[oIdx]}
                                                                        onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                                                                        InputProps={{
                                                                            startAdornment: <InputAdornment position="start"><Typography fontWeight="800" color="primary">{opt}</Typography></InputAdornment>
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            ))}
                                                        </Grid>

                                                        <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <Typography variant="body2" fontWeight="700">Correct Answer:</Typography>
                                                            <Tabs
                                                                value={["A", "B", "C", "D"].includes(q.correctAnswer) ? q.correctAnswer : "A"}
                                                                onChange={(e, v) => handleCorrectAnswerChange(idx, v)}
                                                                sx={{
                                                                    minHeight: 40,
                                                                    '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' }
                                                                }}
                                                            >
                                                                {['A', 'B', 'C', 'D'].map(val => (
                                                                    <Tab key={val} value={val} label={val} sx={{ minWidth: 60, fontWeight: 800 }} />
                                                                ))}
                                                            </Tabs>
                                                        </Box>
                                                    </>
                                                )}
                                            </Paper >
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* RIGHT PANEL: ASSIGNMENT */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', position: 'sticky', top: 40 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>4. Assign to Students</Typography>

                            <TextField
                                fullWidth size="small" placeholder="Search students..."
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" fontWeight="800" color="textSecondary">{selectedStudents.length} SELECTED</Typography>
                                <Button
                                    size="small"
                                    onClick={() => setSelectedStudents(students)}
                                    sx={{ fontSize: '0.7rem', p: 0 }}
                                >
                                    Select All
                                </Button>
                            </Box>

                            <List sx={{ maxHeight: 500, overflow: 'auto', bgcolor: '#f8fafc', borderRadius: '16px' }}>
                                {students
                                    .filter(s => s.name?.toLowerCase().includes(searchStudent.toLowerCase()) || s.email?.toLowerCase().includes(searchStudent.toLowerCase()))
                                    .map((student) => (
                                        <ListItem key={student.studentId} disablePadding>
                                            <ListItemButton onClick={() => toggleStudent(student)} sx={{ borderRadius: '12px', m: 0.5 }}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedStudents.some(s => s.studentId === student.studentId)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                                <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', fontSize: '0.75rem', fontWeight: 800 }}>
                                                    {student.name?.charAt(0) || student.email?.charAt(0)}
                                                </Avatar>
                                                <ListItemText
                                                    primary={<Typography variant="body2" fontWeight="700">{student.name || student.email}</Typography>}
                                                    secondary={<Typography variant="caption">{student.role || 'STUDENT'}</Typography>}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                {students.length === 0 && (
                                    <Box p={4} textAlign="center">
                                        <Typography variant="body2" color="textSecondary">No registered students found.</Typography>
                                    </Box>
                                )}
                            </List>

                            <Box sx={{ mt: 4, p: 2.5, bgcolor: alpha('#6366f1', 0.05), borderRadius: '16px', border: '1px solid', borderColor: alpha('#6366f1', 0.1) }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                    <Typography variant="subtitle2" fontWeight="800">Final Confirmation</Typography>
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                    Once saved, this quiz will immediately appear on the dashboards of the selected students.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default InstructorQuizManager;
