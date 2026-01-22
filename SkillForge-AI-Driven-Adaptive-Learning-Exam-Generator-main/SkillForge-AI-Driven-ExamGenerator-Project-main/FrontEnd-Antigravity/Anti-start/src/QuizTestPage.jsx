import React from 'react';
import { Box, Typography, Button, Container, Paper, Stack } from '@mui/material';
import { Quiz as QuizIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuizTestPage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper sx={{ p: 6, borderRadius: '24px', textAlign: 'center' }}>
                <QuizIcon sx={{ fontSize: 80, color: '#6366f1', mb: 3 }} />

                <Typography variant="h3" fontWeight="900" gutterBottom>
                    Quiz Management Test Page
                </Typography>

                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Use these links to test the quiz management features
                </Typography>

                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                            📊 View Quiz Analytics
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Replace courseId and topicId with your actual values
                        </Typography>
                        <Stack spacing={2}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AssessmentIcon />}
                                onClick={() => navigate('/instructor/course/1/topic/3/quiz/analytics')}
                                sx={{ borderRadius: '16px', fontWeight: 700 }}
                            >
                                Analytics (Course 1, Topic 3)
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<AssessmentIcon />}
                                onClick={() => navigate('/instructor/course/2/topic/5/quiz/analytics')}
                                sx={{ borderRadius: '16px', fontWeight: 700 }}
                            >
                                Analytics (Course 2, Topic 5)
                            </Button>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                            ✏️ Create New Quiz
                        </Typography>
                        <Stack spacing={2}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<QuizIcon />}
                                onClick={() => navigate('/instructor/course/1/topic/3/quiz/create')}
                                sx={{ borderRadius: '16px', fontWeight: 700, bgcolor: '#10b981' }}
                            >
                                Create Quiz (Course 1, Topic 3)
                            </Button>
                        </Stack>
                    </Box>

                    <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: '16px' }}>
                        <Typography variant="caption" color="textSecondary">
                            💡 <strong>Tip:</strong> Update the course ID and topic ID in the URLs above to match your actual data.
                            You can also navigate to these pages from your course materials by adding navigation buttons.
                        </Typography>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
};

export default QuizTestPage;
