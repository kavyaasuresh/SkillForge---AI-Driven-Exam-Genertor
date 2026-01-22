import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    LinearProgress,
    Stack
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Visibility as ViewIcon,
    Lock as LockIcon,
    CheckCircle as DoneIcon,
    Pending as PendingIcon,
    EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { getQuickResultByQuiz } from './services/quizResultService';

const StudentQuizCard = ({ quiz, onAttempt, onViewResult, onRetake }) => {
    const { title, topic, difficulty, status, score, total_marks, totalMarks, percentage } = quiz;
    const [actualResult, setActualResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch actual result data for completed quizzes
    useEffect(() => {
        const fetchActualResult = async () => {
            if ((status === 'ATTEMPTED' || status === 'COMPLETED') && quiz.quiz_id) {
                setLoading(true);
                try {
                    const result = await getQuickResultByQuiz(quiz.quiz_id);
                    setActualResult(result);
                } catch (error) {
                    console.error('Failed to fetch actual result:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchActualResult();
    }, [status, quiz.quiz_id]);

    // Use actual result data if available, otherwise fallback to quiz data
    const displayTotalMarks = actualResult?.totalMarks || total_marks || totalMarks || 100;
    const displayScore = actualResult?.totalScore || actualResult?.score || score || 0;
    const displayPercentage = actualResult?.percentage !== undefined ? actualResult.percentage : 
        (typeof percentage === 'number' ? percentage : Math.round((displayScore / displayTotalMarks) * 100));

    const getStatusConfig = () => {
        switch (status) {
            case 'ATTEMPTED':
            case 'COMPLETED':
                const perc = displayPercentage;
                let c = '#10b981'; // green
                if (perc < 50) c = '#f43f5e'; // red
                else if (perc < 80) c = '#f59e0b'; // orange

                return {
                    label: status === 'COMPLETED' ? 'Completed' : `Score: ${displayScore}/${displayTotalMarks}`,
                    color: c,
                    bgColor: `${c}15`,
                    icon: <DoneIcon sx={{ fontSize: 16 }} />,
                    actionLabel: 'View Results',
                    actionIcon: <ViewIcon />,
                    onClick: onViewResult,
                    showDownload: status === 'COMPLETED'
                };
            case 'PENDING_MANUAL':
                return {
                    label: 'Awaiting Review',
                    color: '#f59e0b', // orange
                    bgColor: '#f59e0b15',
                    icon: <PendingIcon sx={{ fontSize: 16 }} />,
                    actionLabel: 'View Submission',
                    actionIcon: <ViewIcon />,
                    onClick: onViewResult
                };
            case 'ASSIGNED':
                return {
                    label: 'Assigned',
                    color: '#3b82f6', // blue
                    bgColor: '#3b82f615',
                    icon: <StartIcon sx={{ fontSize: 16 }} />,
                    actionLabel: 'Start Quiz',
                    actionIcon: <StartIcon />,
                    onClick: onAttempt
                };
            case 'LOCKED':
            default:
                return {
                    label: 'Locked',
                    color: '#64748b', // grey
                    bgColor: '#64748b15',
                    icon: <LockIcon sx={{ fontSize: 16 }} />,
                    actionLabel: 'Locked',
                    actionIcon: <LockIcon />,
                    disabled: true
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            }
        }}>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                        label={difficulty}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            bgcolor: '#f1f5f9',
                            color: '#475569'
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: config.color,
                            bgcolor: config.bgColor,
                            px: 1,
                            py: 0.5,
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                        }}
                    >
                        {config.icon}
                        {config.label}
                    </Box>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                    {topic}
                </Typography>

                {(status === 'ATTEMPTED' || status === 'COMPLETED') && (
                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                                Progress
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: config.color }}>
                                {Math.round(displayPercentage)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={loading ? 0 : displayPercentage}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: config.color
                                }
                            }}
                        />
                        {actualResult && (
                            <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
                                Actual Score: {displayScore}/{displayTotalMarks}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Stack spacing={1}>
                    {status === 'ASSIGNED' ? (
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<StartIcon />}
                            onClick={onAttempt}
                            sx={{
                                borderRadius: '12px',
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                                }
                            }}
                        >
                            Start Quiz
                        </Button>
                    ) : (status === 'ATTEMPTED' || status === 'COMPLETED') ? (
                        <>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<ViewIcon />}
                                    onClick={onAttempt}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        bgcolor: '#6366f1',
                                        '&:hover': { bgcolor: '#4f46e5' }
                                    }}
                                >
                                    View Result
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<StartIcon />}
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to retake this quiz? Your previous score will be lost.")) {
                                            onRetake && onRetake(quiz.quiz_id);
                                        }
                                    }}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: '#6366f1',
                                        borderColor: '#6366f1',
                                        '&:hover': { borderColor: '#4f46e5', bgcolor: 'rgba(99, 102, 241, 0.05)' }
                                    }}
                                >
                                    Retake
                                </Button>
                            </Box>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ViewIcon />}
                                onClick={onViewResult}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    borderColor: '#cbd5e1',
                                    '&:hover': { borderColor: '#1e293b', bgcolor: 'rgba(30, 41, 59, 0.04)' }
                                }}
                            >
                                Download Full Summary
                            </Button>
                        </>
                    ) : status === 'PENDING_MANUAL' ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<PendingIcon />}
                            onClick={onViewResult}
                            sx={{
                                borderRadius: '12px',
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600,
                                color: '#f59e0b',
                                borderColor: '#f59e0b',
                                '&:hover': { borderColor: '#d97706', bgcolor: 'rgba(245, 158, 11, 0.05)' }
                            }}
                        >
                            View Submission
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="outlined"
                            disabled={config.disabled}
                            startIcon={config.actionIcon}
                            onClick={config.onClick}
                            sx={{
                                borderRadius: '12px',
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            {config.actionLabel}
                        </Button>
                    )}
                </Stack>
            </Box>
        </Card>
    );
};

export default StudentQuizCard;
