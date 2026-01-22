import React, { useState, useEffect } from "react";
import {
    Box, Typography, Grid, Card, CardContent,
    Button, Chip, Divider, Paper, IconButton,
    Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    School as SchoolIcon,
    PlayCircle as VideoIcon,
    Description as PdfIcon,
    ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

import CourseMaterials from "./CourseMaterials";
import { useStudent } from "./context/StudentContext";
import { useNavigate, useParams } from "react-router-dom";

const StudentCourseList = () => {
    const { studentData, loading } = useStudent();
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);

    useEffect(() => {
        if (courseId && studentData.enrolledCourses.length > 0) {
            const course = studentData.enrolledCourses.find(c => c.course_id.toString() === courseId);
            if (course) {
                setSelectedCourse(course);
            }
        } else if (!courseId) {
            setSelectedCourse(null);
        }
    }, [courseId, studentData.enrolledCourses]);

    if (loading) return <Box p={4}>Loading courses...</Box>;

    if (selectedTopic) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
                <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                    <CourseMaterials
                        courseId={selectedCourse.course_id}
                        topicId={selectedTopic.id}
                        onBack={() => setSelectedTopic(null)}
                    />
                </Box>
            </Box>
        );
    }

    if (selectedCourse) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
                <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => navigate('/student/courses')} sx={{ bgcolor: 'white' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                {selectedCourse.title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b' }}>
                                Browse topics and learning materials
                            </Typography>
                        </Box>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                                Course Content
                            </Typography>
                            {selectedCourse.topics && selectedCourse.topics.length > 0 ? (
                                selectedCourse.topics.map((topic, index) => (
                                    <Accordion
                                        key={topic.id}
                                        sx={{
                                            mb: 2,
                                            borderRadius: '16px !important',
                                            boxShadow: 'none',
                                            border: '1px solid #f1f5f9',
                                            '&:before': { display: 'none' }
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '8px',
                                                    bgcolor: '#f1f5f9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    color: '#64748b'
                                                }}>
                                                    {index + 1}
                                                </Box>
                                                <Typography sx={{ fontWeight: 600 }}>{topic.title}</Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ pt: 0, px: 3, pb: 2 }}>
                                            <Divider sx={{ mb: 2 }} />
                                            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                                                {topic.description || "In this topic, you will learn the fundamental concepts and practical applications."}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => setSelectedTopic(topic)}
                                                sx={{
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    bgcolor: '#1e293b',
                                                    '&:hover': { bgcolor: '#334155' }
                                                }}
                                            >
                                                View Materials
                                            </Button>
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            ) : (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px', border: '1px dashed #e2e8f0', bgcolor: 'transparent' }}>
                                    <Typography sx={{ color: '#64748b' }}>No topics added yet for this course.</Typography>
                                </Paper>
                            )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>About this course</Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                                        {selectedCourse.description || "Learn professionally with our expert-led courses designed for your career growth."}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>Difficulty</Typography>
                                            <Chip label={selectedCourse.difficulty || 'Beginner'} size="small" color="primary" sx={{ fontWeight: 600 }} />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>Instructor</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>SkillForge Expert</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                        Course Catalog 📚
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>
                        Expand your skills with our wide range of professional courses.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {studentData.enrolledCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                            <Card sx={{
                                borderRadius: '20px',
                                border: '1px solid #f1f5f9',
                                aspectRatio: '1 / 1',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 20px -5px rgb(0 0 0 / 0.1)'
                                }
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 3,
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <SchoolIcon sx={{
                                        color: 'white',
                                        fontSize: 100,
                                        opacity: 0.1,
                                        position: 'absolute',
                                        top: -20,
                                        right: -20
                                    }} />
                                    <Typography variant="h6" sx={{
                                        color: 'white',
                                        fontWeight: 800,
                                        mb: 3,
                                        position: 'relative',
                                        zIndex: 1,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        {course.title}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate(`/student/course/${course.course_id}`)}
                                        sx={{
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            bgcolor: 'white',
                                            color: '#6366f1',
                                            px: 4,
                                            '&:hover': {
                                                bgcolor: '#f8fafc',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        Browse Course
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default StudentCourseList;
