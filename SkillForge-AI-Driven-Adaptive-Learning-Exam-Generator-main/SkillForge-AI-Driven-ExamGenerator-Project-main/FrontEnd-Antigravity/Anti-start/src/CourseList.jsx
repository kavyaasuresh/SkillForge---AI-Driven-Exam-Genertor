import React, { useState, useEffect } from "react";
import {
    Box, Typography, Button, Card, CardContent, TextField,
    IconButton, Divider, Stack, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, MenuItem, Chip, Table,
    TableHead, TableRow, TableCell, TableBody, Tooltip,
    Container, Grid, InputAdornment, useTheme, alpha,
    Fade, Avatar, Tabs, Tab
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { courseService } from "./services/courseService";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SchoolIcon from "@mui/icons-material/School";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ImageIcon from "@mui/icons-material/Image";
import LinkIcon from "@mui/icons-material/Link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ClassIcon from "@mui/icons-material/Class";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupIcon from "@mui/icons-material/Group";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LogoutIcon from "@mui/icons-material/Logout";
import QuizIcon from "@mui/icons-material/Quiz";
import axios from "axios";

const materialTypes = ["PDF", "Video", "Image", "Link"];
const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
// Mapping for display labels if needed, or use directly
const difficultyLabels = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
// Mapping backend values to colors
const difficultyColors = { BEGINNER: "success", INTERMEDIATE: "warning", ADVANCED: "error" };

export default function CourseList({ courses, setCourses }) {
    const theme = useTheme();

    /* ---------------- STATES ---------------- */
    const [openNav, setOpenNav] = useState(false);
    // courses and setCourses are now passed as props
    const [activeCourseId, setActiveCourseId] = useState(null);
    const [openCourseForm, setOpenCourseForm] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const navigate = useNavigate();
    const [courseForm, setCourseForm] = useState({
        course_id: "",
        instructor_id: "",
        course_title: "",
        description: "",
        difficulty: "BEGINNER",
        student_strength: 0
    });

    const [topicForm, setTopicForm] = useState({ name: "", description: "", difficulty: "BEGINNER" });
    const [materialForm, setMaterialForm] = useState({ type: "", name: "", url: "", file: null, uploadMode: 'url' });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    // Removed unused materials state
    const [previewMaterial, setPreviewMaterial] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [difficultyFilter, setDifficultyFilter] = useState("All");
    const [expandedTopics, setExpandedTopics] = useState({});

    /* ---------------- HYDRATION ---------------- */
    // Moved to App.jsx for shared state, but we ensure courses are loaded
    useEffect(() => {
        if (!courses || courses.length === 0) {
            loadCourses();
        }
    }, []);

    const loadCourses = async () => {
        const data = await courseService.getCourses();
        setCourses(data);
    };

    /* ---------------- COURSE HANDLERS ---------------- */

    const handleSaveCourse = async () => {
        if (!courseForm.course_title) return;

        try {
            const isEditing = !!editingCourseId;
            const updatedCourses = await courseService.saveCourse(courseForm, isEditing);

            setCourses(updatedCourses);

            if (!isEditing) {
                // New course: open editor automatically
                // Note: The new course ID might be generated by backend if not provided.
                // ideally we use the returned list to find the one we just made, but for now we assume ID was in form or user finds it.
                // If user entered ID manually:
                if (courseForm.course_id) {
                    setActiveCourseId(courseForm.course_id);
                }
            }

            // Reset form after save
            setCourseForm({
                course_id: "",
                instructor_id: "",
                course_title: "",
                description: "",
                difficulty: "BEGINNER",
                student_strength: 0
            });
            setEditingCourseId(null);
            setOpenCourseForm(false);
        } catch (err) {
            console.error("Failed to save course:", err);
            alert("Error saving course. Please try again.");
        }
    };

    const handleEditCourse = (course) => {
        setCourseForm({
            ...course,
            student_strength: course.student_strength || 0
        });
        setEditingCourseId(course.course_id);
        setOpenCourseForm(true);
    };

    // Settings Save Handler (mapped to same save logic)
    const handleSaveSettings = async () => {
        await handleSaveCourse();
        // Optionally show success toast
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            const updatedCourses = await courseService.deleteCourse(id);
            setCourses(updatedCourses);
            if (activeCourseId === id) setActiveCourseId(null);
        } catch (err) {
            console.error("Failed to delete course:", err);
            alert("Error deleting course. Please try again.");
        }
    };

    // Add Topic
    const handleAddTopic = async (course_id) => {
        if (!topicForm.name) return;
        try {
            const updated = await courseService.saveTopic(course_id, null, topicForm);
            setCourses(updated);
            setTopicForm({ name: "", description: "", difficulty: "BEGINNER" });
        } catch (err) {
            alert("Error adding topic.");
        }
    };

    const handleAddMaterial = async () => {
        const isFileUpload = materialForm.uploadMode === 'file' && materialForm.file;
        const isUrlUpload = materialForm.uploadMode === 'url' && materialForm.url;

        if (!materialForm.name || !materialForm.type || (!isFileUpload && !isUrlUpload)) {
            alert("Please fill all required fields.");
            return;
        }

        const course = courses.find(c => c.course_id === selectedTopic.course_id);
        const topic = course.topics[selectedTopic.topicIndex];

        if (!course || !topic) return;

        try {
            if (isFileUpload) {
                // Upload file
                await courseService.uploadMaterialFile(
                    topic.id,
                    materialForm.file,
                    materialForm.name,
                    materialForm.type.toUpperCase()
                );
            } else {
                // URL-based material
                const materialPayload = {
                    title: materialForm.name,
                    materialType: materialForm.type.toUpperCase(),
                    contentUrl: materialForm.url,
                    topic: { id: topic.id }
                };
                await courseService.addMaterial(materialPayload);
            }

            // Reload materials for this topic
            await loadMaterials(topic.id);
            setExpandedTopics(prev => ({ ...prev, [topic.id]: true }));

            setMaterialForm({ name: "", type: "", url: "", file: null, uploadMode: 'url' });
            setOpenMaterialDialog(false);
        } catch (err) {
            console.error("Error saving material:", err);
            alert("Failed to save material.");
        }
    };


    const handleDeleteMaterial = async (courseId, topicIndex, materialId) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;

        try {
            await courseService.deleteMaterial(materialId);

            // Optimistic Delete
            const updatedCourses = courses.map(c => {
                if (c.course_id === courseId) {
                    const newTopics = [...c.topics];
                    const currentMaterials = newTopics[topicIndex].materials || [];
                    newTopics[topicIndex] = {
                        ...newTopics[topicIndex],
                        materials: currentMaterials.filter(m => (m.materialId !== materialId && m.material_id !== materialId))
                    };
                    return { ...c, topics: newTopics };
                }
                return c;
            });
            setCourses(updatedCourses);
            if (previewMaterial && (previewMaterial.materialId === materialId || previewMaterial.material_id === materialId)) {
                setPreviewMaterial(null);
            }
        } catch (err) {
            console.error("Error deleting material:", err);
            alert("Failed to delete material.");
        }
    };


    /* ---------------- FILTER ---------------- */
    const filteredTopics = (topics, course_title) => {
        if (!topics) return [];
        let filtered = topics.filter(t =>
            (t.name && t.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.difficulty && t.difficulty.toLowerCase().includes(searchTerm.toLowerCase())) ||
            course_title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Note: filteredTopics logic is implemented inline in JSX typically, or used here. 
        // We'll trust the JSX implementation below which does inline filtering.
        return filtered;
    };

    const getEmbedUrl = (url) => {
        if (!url) return "";
        let embedUrl = url;
        // Ensure protocol
        if (!embedUrl.startsWith("http")) embedUrl = "https://" + embedUrl;

        // Handle YouTube
        if (embedUrl.includes("youtube.com/watch?v=")) {
            embedUrl = embedUrl.replace("youtube.com/watch?v=", "youtube.com/embed/");
            // Handle params like &t=
            if (embedUrl.includes("&")) embedUrl = embedUrl.split("&")[0];
        } else if (embedUrl.includes("youtu.be/")) {
            embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
        }
        return embedUrl;
    };
    const toggleMaterials = (topicId) => {
        setExpandedTopics(prev => {
            const isExpanding = !prev[topicId];
            if (isExpanding) {
                loadMaterials(topicId);
            }
            return { ...prev, [topicId]: isExpanding };
        });
    };

    const loadMaterials = async (topicId) => {
        try {
            const materials = await courseService.getMaterialsByTopic(topicId);

            // Update courses state
            setCourses(prevCourses =>
                prevCourses.map(course => ({
                    ...course,
                    topics: course.topics.map(topic => {
                        if (topic.id === topicId) {
                            return { ...topic, materials }; // update only this topic
                        }
                        return topic;
                    })
                }))
            );
        } catch (err) {
            console.error("Failed to load materials:", err);
        }
    };


    const renderPreviewIcon = (material) => {
        const type = material.materialType || material.type;
        switch (type) {
            case "PDF": return <PictureAsPdfIcon color="error" />;
            case "tVIDEO": // Handle possible backend enum variations if needed, though usually it's VIDEO
            case "VIDEO":
            case "Video": return <VideoLibraryIcon color="primary" />;
            case "IMAGE":
            case "Image": return <ImageIcon color="warning" />;
            case "LINK": // Link
            case "Link": return <LinkIcon color="info" />;
            default: return null;
        }
    };

    /* ---------------- JSX ---------------- */
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 5 }}>
            {/* GLOBAL HEADER */}
            <Box sx={{
                bgcolor: "white",
                px: { xs: 2, md: 6 },
                py: 2,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'sticky', top: 0, zIndex: 1100
            }}>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => setOpenNav(true)} sx={{ mr: 2, color: 'text.secondary' }}>
                        <MenuIcon />
                    </IconButton>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <SchoolIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                            Skill<Box component="span" sx={{ color: 'primary.main' }}>Forge</Box>
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 3, height: 24, alignSelf: 'center', borderColor: '#e2e8f0' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {activeCourseId ? 'Course Editor' : 'Instructor Dashboard'}
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    {activeCourseId ? (
                        <Button
                            variant="outlined"
                            onClick={() => setActiveCourseId(null)}
                            startIcon={<CloseIcon />}
                            sx={{ borderRadius: 2, color: 'text.secondary', bgcolor: '#f1f5f9', fontWeight: 700, border: 'none' }}
                        >
                            Exit Editor
                        </Button>
                    ) : (
                        courses.length > 0 && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setCourseForm({
                                        course_id: "",
                                        instructor_id: "",
                                        course_title: "",
                                        description: "",
                                        difficulty: "BEGINNER",
                                        student_strength: 0
                                    });
                                    setEditingCourseId(null);
                                    setOpenCourseForm(true);
                                }}
                                sx={{ px: 3 }}
                            >
                                Create New Course
                            </Button>
                        )
                    )}
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: '0.875rem', fontWeight: 800 }}>JD</Avatar>
                </Box>
            </Box>

            {/* MAIN CONTENT AREA */}
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                {!activeCourseId ? (
                    /* --- VIEW 1: COURSE GALLERY --- */
                    <Fade in>
                        <Box>
                            {courses.length === 0 ? (
                                /* Empty state as helping hero */
                                <Box sx={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    minHeight: '70vh', textAlign: "center", p: 4
                                }}>
                                    <Box sx={{ p: 4, bgcolor: 'white', borderRadius: '50%', mb: 3, boxShadow: 2 }}>
                                        <SchoolIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Build your learning universe</Typography>
                                    <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mb: 4 }}>
                                        SkillForge helps you organize content, track students, and deliver premium learning experiences. Let's start by creating your first course.
                                    </Typography>
                                    <Button
                                        size="large"
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => setOpenCourseForm(true)}
                                        sx={{ py: 1.5, px: 4, borderRadius: 3 }}
                                    >
                                        Create First Course
                                    </Button>
                                </Box>
                            ) : (
                                <Box>
                                    {/* Dashboard Stats */}
                                    <Grid container spacing={3} mb={6}>
                                        <Grid item xs={12} md={4}>
                                            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, borderRadius: 4 }}>
                                                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3, color: 'primary.main' }}>
                                                    <ClassIcon />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h4" fontWeight="800">{courses.length}</Typography>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="700">ACTIVE COURSES</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, borderRadius: 4 }}>
                                                <Box sx={{ p: 2, bgcolor: alpha('#10b981', 0.1), borderRadius: 3, color: '#10b981' }}>
                                                    <AutoStoriesIcon />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h4" fontWeight="800">{courses.reduce((acc, c) => acc + (c.topics ? c.topics.length : 0), 0)}</Typography>
                                                    <Typography variant="body2" color="text.secondary" fontWeight="700">TOTAL TOPICS</Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 800 }}>Your Courses</Typography>
                                            <Typography variant="body2" color="text.secondary">Select a course to manage its curriculum and contents.</Typography>
                                        </Box>
                                        <Box display="flex" gap={2}>
                                            <TextField
                                                size="small"
                                                placeholder="Search courses..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                                                sx={{ width: 300, bgcolor: 'white' }}
                                            />
                                        </Box>
                                    </Box>

                                    <Grid container spacing={4}>
                                        {courses.filter(course =>
                                            course.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(course => (
                                            <Grid item xs={12} md={6} lg={4} key={course.course_id}>
                                                <Card onClick={() => setActiveCourseId(course.course_id)} sx={{
                                                    cursor: 'pointer',
                                                    height: '100%',
                                                    minHeight: 280,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    overflow: 'hidden',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': { transform: 'translateY(-6px)', boxShadow: 6, borderColor: 'primary.light' }
                                                }}>
                                                    {/* Card "Cap" - Professional Gradient Header */}
                                                    <Box sx={{
                                                        background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
                                                        p: 3,
                                                        color: 'white',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {/* Decorative Background Circle */}
                                                        <Box sx={{
                                                            position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                                                            borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
                                                        }} />

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                                                            <Box sx={{
                                                                p: 1, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.2)',
                                                                backdropFilter: 'blur(4px)', display: 'flex'
                                                            }}>
                                                                <SchoolIcon sx={{ fontSize: 24 }} />
                                                            </Box>
                                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, letterSpacing: 0.5 }}>{course.course_id}</Typography>
                                                                <Typography
                                                                    variant="h6"
                                                                    sx={{
                                                                        fontWeight: 800,
                                                                        lineHeight: 1.2,
                                                                        wordBreak: 'break-word'
                                                                    }}
                                                                    title={course.course_title}
                                                                >
                                                                    {course.course_title}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{
                                                            mb: 3, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                        }}>
                                                            {course.description || "No description provided."}
                                                        </Typography>

                                                        <Stack spacing={2}>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                                    <Typography variant="caption" fontWeight="700" color="text.primary">{course.instructor_id}</Typography>
                                                                </Box>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <GroupIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                                    <Typography variant="caption" fontWeight="700" color="text.primary">{course.student_strength || 0}</Typography>
                                                                </Box>
                                                            </Box>

                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                fullWidth
                                                                endIcon={<ArrowForwardIcon fontSize="small" />}
                                                                sx={{ py: 1, fontWeight: 800, borderRadius: 2, boxShadow: 'none', bgcolor: '#e0e7ff', color: 'primary.main', '&:hover': { bgcolor: '#c7d2fe' } }}
                                                            >
                                                                Manage Content
                                                            </Button>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    </Fade>
                ) : (
                    /* --- VIEW 2: COURSE EDITOR (70/30 Split) --- */
                    <Fade in>
                        <Box>
                            {courses.filter(c => c.course_id === activeCourseId).map(course => (
                                <Box key={course.course_id}>
                                    {/* Editor Header */}
                                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>{course.course_title}</Typography>
                                            <Box display="flex" gap={3} alignItems="center">
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    <Typography variant="body2" fontWeight="600" color="text.secondary">{course.instructor_id}</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <GroupIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    <Typography variant="body2" fontWeight="600" color="text.secondary">{course.student_strength || 0} Students enrolled</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => handleEditCourse(course)}>Edit Details</Button>
                                            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteCourse(course.course_id)}>Delete</Button>
                                        </Box>
                                    </Box>

                                    {/* Tabs Navigation */}
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                                        <Tabs
                                            value={tabValue}
                                            onChange={(e, v) => {
                                                setTabValue(v);
                                                if (v === 2) {
                                                    // Sync form with current course when entering settings
                                                    setCourseForm(course);
                                                }
                                            }}
                                            sx={{ minHeight: 40 }}
                                        >
                                            <Tab label="Curriculum" sx={{ fontWeight: 700, px: 0, mr: 4, minWidth: 0 }} />
                                            <Tab label="Analytics" sx={{ fontWeight: 700, px: 0, mr: 4, minWidth: 0 }} />
                                            <Tab label="Settings" sx={{ fontWeight: 700, px: 0, mr: 4, minWidth: 0 }} />
                                        </Tabs>
                                    </Box>

                                    {/* TAB CONTENT: CURRICULUM */}
                                    {tabValue === 0 && (
                                        <Grid container spacing={4}>
                                            {/* LEFT: Curriculum List */}
                                            <Grid item xs={12} md={8}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                                    <Typography variant="h6" fontWeight="800">Course Curriculum</Typography>
                                                    <Box display="flex" gap={1}>
                                                        <TextField
                                                            size="small"
                                                            placeholder="Filter topics..."
                                                            value={searchTerm}
                                                            onChange={e => setSearchTerm(e.target.value)}
                                                            sx={{ width: 220, bgcolor: 'white' }}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>

                                                {!course.topics || course.topics.length === 0 ? (
                                                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'white', border: '2px dashed', borderColor: 'divider' }}>
                                                        <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                                        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1, fontWeight: 700 }}>No topics yet</Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Use the panel on the right to start building your curriculum.</Typography>
                                                    </Paper>
                                                ) : (
                                                    <Stack spacing={3}>
                                                        {course.topics.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((topic, idx) => (
                                                            <Card key={idx} sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', '&:hover': { boxShadow: 1, borderColor: alpha(theme.palette.primary.main, 0.2) } }}>
                                                                <CardContent sx={{ p: 3 }}>
                                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                                                        <Box display="flex" alignItems="center" gap={2}>
                                                                            <Chip label={topic.difficulty ? difficultyLabels[topic.difficulty] : 'General'} size="small" color={difficultyColors[topic.difficulty] || "default"} sx={{ fontWeight: 800, px: 1, borderRadius: 2 }} />
                                                                            <Typography variant="h6" fontWeight="700">{topic.name}</Typography>
                                                                        </Box>
                                                                        <Box display="flex" gap={1}>
                                                                            <Button
                                                                                startIcon={<AssessmentIcon />}
                                                                                variant="text"
                                                                                size="small"
                                                                                color="primary"
                                                                                onClick={() => navigate(`/instructor/quiz-manager/${course.course_id}/${topic.id}`)}
                                                                            >
                                                                                Quizzes
                                                                            </Button>
                                                                            <Button startIcon={<AutoStoriesIcon />} variant="text" size="small" onClick={() => toggleMaterials(topic.id)}>
                                                                                {expandedTopics[topic.id] ? "Hide Materials" : "View Materials"}
                                                                            </Button>
                                                                            <Button startIcon={<AddIcon />} variant="text" size="small" onClick={() => { setMaterialForm({ type: "", name: "", url: "" }); setSelectedTopic({ course_id: course.course_id, topicIndex: idx, materialId: null }); setOpenMaterialDialog(true); }}>
                                                                                Add Material
                                                                            </Button>
                                                                        </Box>
                                                                    </Box>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>{topic.description}</Typography>

                                                                    {expandedTopics[topic.id] && topic.materials && topic.materials.length > 0 && (
                                                                        <Stack spacing={1.5} sx={{ ml: 2, borderLeft: '2px solid', borderColor: 'divider', pl: 3 }}>
                                                                            {topic.materials.map((m, i) => (
                                                                                <Box key={i} sx={{
                                                                                    p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                                    bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider',
                                                                                    transition: 'all 0.2s',
                                                                                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02), transform: 'translateX(4px)' }
                                                                                }}>
                                                                                    <Box display="flex" alignItems="center" gap={2}>
                                                                                        {renderPreviewIcon(m)}
                                                                                        <Typography variant="body2" fontWeight="700">{m.title || m.name}</Typography>
                                                                                    </Box>
                                                                                    <Box display="flex" gap={0.5}>
                                                                                        <Tooltip title="Preview"><IconButton size="small" onClick={() => setPreviewMaterial(m)}><AutoStoriesIcon fontSize="small" /></IconButton></Tooltip>
                                                                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => {
                                                                                            setMaterialForm({ type: m.materialType || m.type, name: m.title || m.name, url: m.contentUrl || m.url || "" });
                                                                                            setSelectedFile(m.file || null);
                                                                                            setSelectedTopic({ course_id: course.course_id, topicIndex: idx, materialIndex: i, materialId: m.materialId || m.material_id });
                                                                                            setOpenMaterialDialog(true);
                                                                                        }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteMaterial(course.course_id, idx, m.materialId || m.material_id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                                                    </Box>
                                                                                </Box>
                                                                            ))}
                                                                        </Stack>
                                                                    )}

                                                                    {/* Professional Preview Frame - Targeted */}
                                                                    {previewMaterial && topic.materials && topic.materials.includes(previewMaterial) && (
                                                                        <Fade in>
                                                                            <Paper elevation={0} sx={{
                                                                                mt: 3, borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider',
                                                                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                                                                            }}>
                                                                                <Box sx={{ bgcolor: '#f1f5f9', px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                                                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                                                        {renderPreviewIcon(previewMaterial)}
                                                                                        <Typography variant="subtitle2" fontWeight="bold">Reviewing: {previewMaterial.title || previewMaterial.name}</Typography>
                                                                                    </Box>
                                                                                    <IconButton size="small" onClick={() => setPreviewMaterial(null)} sx={{ bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)', color: 'error.main' } }}><CloseIcon fontSize="small" /></IconButton>
                                                                                </Box>
                                                                                <Box sx={{ bgcolor: '#0f172a', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                    {(previewMaterial.materialType === "PDF" || previewMaterial.type === "PDF") && <iframe src={getEmbedUrl(previewMaterial.contentUrl || previewMaterial.url)} width="100%" height="500px" title="Preview" style={{ border: 0, background: 'white' }} />}
                                                                                    {(previewMaterial.materialType === "VIDEO" || previewMaterial.type === "Video" || previewMaterial.materialType === "Video") && (
                                                                                        <iframe
                                                                                            src={getEmbedUrl(previewMaterial.contentUrl || previewMaterial.url)}
                                                                                            width="100%"
                                                                                            height="500px"
                                                                                            title="Video Preview"
                                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                            allowFullScreen
                                                                                            style={{ border: 0, background: 'black' }}
                                                                                        />
                                                                                    )}
                                                                                    {(previewMaterial.materialType === "IMAGE" || previewMaterial.type === "Image" || previewMaterial.materialType === "Image") && <img src={previewMaterial.contentUrl || previewMaterial.url} alt="Preview" style={{ maxWidth: "100%", maxHeight: 500, objectFit: 'contain' }} />}
                                                                                    {(previewMaterial.materialType === "LINK" || previewMaterial.type === "Link" || previewMaterial.materialType === "Link") && <iframe src={getEmbedUrl(previewMaterial.contentUrl || previewMaterial.url)} width="100%" height="500px" title="Link Preview" style={{ border: 0, background: 'white' }} />}
                                                                                </Box>
                                                                            </Paper>
                                                                        </Fade>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </Stack>
                                                )}
                                            </Grid>

                                            {/* RIGHT: Inspector Panel (Sticky) */}
                                            < Grid item xs={12} md={4} >
                                                <Box sx={{ position: 'sticky', top: 100 }}>
                                                    <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Add New Topic</Typography>
                                                        <Stack spacing={3}>
                                                            <TextField
                                                                fullWidth
                                                                label="Topic Title"
                                                                placeholder="e.g. Introduction to React"
                                                                value={topicForm.name}
                                                                onChange={e => setTopicForm({ ...topicForm, name: e.target.value })}
                                                                sx={{ bgcolor: 'white' }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Description"
                                                                placeholder="Short overview of the topic"
                                                                multiline rows={3}
                                                                value={topicForm.description}
                                                                onChange={e => setTopicForm({ ...topicForm, description: e.target.value })}
                                                                sx={{ bgcolor: 'white' }}
                                                            />
                                                            <Box>
                                                                <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1.5, display: 'block', letterSpacing: '0.5px' }}>DIFFICULTY LEVEL</Typography>
                                                                <Stack direction="row" spacing={1}>
                                                                    {difficulties.map(d => (
                                                                        <Chip
                                                                            key={d}
                                                                            label={difficultyLabels[d]}
                                                                            onClick={() => setTopicForm({ ...topicForm, difficulty: d })}
                                                                            color={topicForm.difficulty === d ? difficultyColors[d] : 'default'}
                                                                            variant={topicForm.difficulty === d ? 'filled' : 'outlined'}
                                                                            sx={{ fontWeight: 700, borderRadius: 2 }}
                                                                        />
                                                                    ))}
                                                                </Stack>
                                                            </Box>
                                                            <Button
                                                                variant="contained"
                                                                size="large"
                                                                onClick={() => handleAddTopic(course.course_id)}
                                                                fullWidth
                                                                sx={{ py: 1.5, mt: 1, borderRadius: 3, fontWeight: 800 }}
                                                            >
                                                                Create Topic
                                                            </Button>
                                                        </Stack>
                                                    </Paper>

                                                    {/* Additional Info / Help Card */}
                                                    <Paper sx={{ p: 3, mt: 3, borderRadius: 4, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
                                                        <Typography variant="subtitle2" fontWeight="800" color="primary.main" gutterBottom>Pro Tip</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Group your lessons by difficulty to help students navigate their learning path more effectively.
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* TAB CONTENT: ANALYTICS */}
                                    {tabValue === 1 && (
                                        <Fade in>
                                            <Box>
                                                <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>Performance Metrics</Typography>
                                                <Grid container spacing={3} mb={6}>
                                                    {[
                                                        { label: 'Completion Rate', value: '78%', icon: <TrendingUpIcon />, color: '#10b981' },
                                                        { label: 'Avg. Engagement', value: '42m', icon: <AssessmentIcon />, color: '#6366f1' },
                                                        { label: 'Active Students', value: course.student_strength, icon: <GroupIcon />, color: '#f59e0b' }
                                                    ].map((stat, i) => (
                                                        <Grid item xs={12} md={4} key={i}>
                                                            <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                                <Box sx={{ p: 2, bgcolor: alpha(stat.color, 0.1), color: stat.color, borderRadius: 3 }}>{stat.icon}</Box>
                                                                <Box>
                                                                    <Typography variant="h4" fontWeight="800">{stat.value}</Typography>
                                                                    <Typography variant="body2" color="text.secondary" fontWeight="700">{stat.label}</Typography>
                                                                </Box>
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>

                                                <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02), border: '1px dashed', borderColor: 'divider' }}>
                                                    <AssessmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                                    <Typography variant="h6" fontWeight="700">Analytics Dashboard</Typography>
                                                    <Typography variant="body2" color="text.secondary">Detailed engagement charts and individual student progress reports are coming soon.</Typography>
                                                </Paper>
                                            </Box>
                                        </Fade>
                                    )}

                                    {/* TAB CONTENT: SETTINGS */}
                                    {tabValue === 2 && (
                                        <Fade in>
                                            <Box>
                                                <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>Course Configuration</Typography>
                                                <Paper sx={{ p: 4, borderRadius: 4 }}>
                                                    <Grid container spacing={4}>
                                                        <Grid item xs={12} md={6}>
                                                            <Stack spacing={3}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Course Title"
                                                                    value={courseForm.course_title}
                                                                    onChange={e => setCourseForm({ ...courseForm, course_title: e.target.value })}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label="Instructor ID"
                                                                    value={courseForm.instructor_id}
                                                                    onChange={e => setCourseForm({ ...courseForm, instructor_id: e.target.value })}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label="Max Student Capacity"
                                                                    type="number"
                                                                    value={courseForm.student_strength || 0}
                                                                    onChange={e => setCourseForm({ ...courseForm, student_strength: e.target.value })}
                                                                />
                                                            </Stack>
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Description"
                                                                multiline
                                                                rows={6}
                                                                value={courseForm.description}
                                                                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Divider sx={{ my: 1 }} />
                                                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                                                <Button variant="outlined" onClick={() => setCourseForm(course)}>Restore Defaults</Button>
                                                                <Button variant="contained" onClick={handleSaveSettings}>Save Changes</Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>

                                                <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.1) }}>
                                                    <Typography variant="subtitle2" fontWeight="800" color="error.main" gutterBottom>Danger Zone</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Once you delete a course, there is no going back. Please be certain.</Typography>
                                                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDeleteCourse(course.course_id)}>Delete Course</Button>
                                                </Paper>
                                            </Box>
                                        </Fade>
                                    )}
                                </Box>
                            ))
                            }
                        </Box >
                    </Fade >
                )}
            </Container >


            {/* DRAWER */}
            < Drawer
                anchor="left"
                open={openNav}
                onClose={() => setOpenNav(false)}
                PaperProps={{ sx: { width: 280, borderRight: 'none', bgcolor: 'background.paper' } }}
            >
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Typography variant="h6" fontWeight="bold">SkillForge</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List sx={{ px: 2 }}>
                    {[
                        { text: "Dashboard", icon: <DashboardIcon />, path: "/instructor/dashboard" },
                        { text: "Manage Courses", icon: <ClassIcon />, path: "/instructor/courses" },
                        { text: "Quizzes", icon: <QuizIcon />, path: "/instructor/quizzes" },
                        { text: "Logout", icon: <LogoutIcon />, path: "/" },
                    ].map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); setOpenNav(false); }}
                                sx={{ borderRadius: 2, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer >


            {/* MATERIAL DIALOG - ENHANCED WITH FILE UPLOAD */}
            <Dialog open={openMaterialDialog} onClose={() => setOpenMaterialDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
                <Box sx={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', p: 3, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}><UploadFileIcon /></Box>
                        <Typography variant="h6" fontWeight="bold">Add Learning Material</Typography>
                    </Box>
                    <IconButton onClick={() => setOpenMaterialDialog(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </Box>
                <DialogContent sx={{ bgcolor: '#f8fafc', p: 3 }}>
                    <Stack spacing={3} mt={1}>
                        <TextField
                            fullWidth label="Material Name"
                            value={materialForm.name}
                            onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })}
                            sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <TextField
                            fullWidth select label="Material Type"
                            value={materialForm.type}
                            onChange={e => setMaterialForm({ ...materialForm, type: e.target.value })}
                            sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        >
                            {['PDF', 'Video', 'Image', 'DOCX', 'Link'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </TextField>

                        {/* Upload Mode Toggle */}
                        <Box sx={{ display: 'flex', gap: 1, bgcolor: 'white', p: 1, borderRadius: 2 }}>
                            <Button
                                fullWidth
                                variant={materialForm.uploadMode === 'url' ? 'contained' : 'outlined'}
                                onClick={() => setMaterialForm({ ...materialForm, uploadMode: 'url', file: null })}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                🔗 URL Link
                            </Button>
                            <Button
                                fullWidth
                                variant={materialForm.uploadMode === 'file' ? 'contained' : 'outlined'}
                                onClick={() => setMaterialForm({ ...materialForm, uploadMode: 'file', url: '' })}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                📁 Upload File
                            </Button>
                        </Box>

                        {materialForm.uploadMode === 'url' ? (
                            <TextField
                                fullWidth
                                label={materialForm.type === "Link" ? "Website URL" : `${materialForm.type || 'File'} URL`}
                                placeholder={materialForm.type === "Link" ? "https://example.com" : `https://example.com/file.${materialForm.type === "PDF" ? "pdf" : "mp4"}`}
                                value={materialForm.url}
                                onChange={e => setMaterialForm({ ...materialForm, url: e.target.value })}
                                sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                helperText={materialForm.type !== "Link" ? "Provide a direct link to the file" : "Link to external content"}
                            />
                        ) : (
                            <Box
                                sx={{
                                    p: 4,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    border: '2px dashed',
                                    borderColor: materialForm.file ? 'primary.main' : '#cbd5e1',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: '#f0f7ff' }
                                }}
                                onClick={() => document.getElementById('material-file-input').click()}
                            >
                                <input
                                    id="material-file-input"
                                    type="file"
                                    hidden
                                    accept={
                                        materialForm.type === 'PDF' ? '.pdf' :
                                            materialForm.type === 'Video' ? 'video/*' :
                                                materialForm.type === 'Image' ? 'image/*' :
                                                    materialForm.type === 'DOCX' ? '.docx,.doc' :
                                                        '*/*'
                                    }
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setMaterialForm({ ...materialForm, file: file });
                                        }
                                    }}
                                />
                                {materialForm.file ? (
                                    <Box>
                                        <Typography variant="body1" fontWeight={700} color="primary.main">
                                            ✅ {materialForm.file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(materialForm.file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <UploadFileIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                                        <Typography variant="body1" fontWeight={600} color="text.secondary">
                                            Click to select {materialForm.type || 'file'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            PDF, Images, Videos, DOCX supported (Max 50MB)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenMaterialDialog(false)} color="inherit">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddMaterial}
                        disabled={!materialForm.name || !materialForm.type || (materialForm.uploadMode === 'url' ? !materialForm.url : !materialForm.file)}
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        {materialForm.uploadMode === 'file' ? 'Upload File' : 'Add Material'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* COURSE FORM DIALOG - ENHANCED PREMIUM DESIGN */}
            < Dialog
                open={openCourseForm}
                onClose={() => { setOpenCourseForm(false); setEditingCourseId(null); }}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: '#fff'
                    }
                }}
            >
                {/* Helper for Header Gradient */}
                < Box sx={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
                    p: 4,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Circle */}
                    < Box sx={{
                        position: 'absolute', top: -20, right: -20, width: 150, height: 150,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.1)'
                    }} />

                    < Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
                        <Box sx={{
                            p: 1.5, borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                        }}>
                            {editingCourseId ? <EditIcon sx={{ fontSize: 32 }} /> : <AddCircleOutlineIcon sx={{ fontSize: 32 }} />}
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="800" letterSpacing="-0.5px">
                                {editingCourseId ? "Edit Course Details" : "Create New Course"}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {editingCourseId ? "Update your course information below." : "Fill in the details to launch a new learning journey."}
                            </Typography>
                        </Box>
                    </Box >
                    <IconButton onClick={() => { setOpenCourseForm(false); setEditingCourseId(null); }} sx={{ color: 'white', zIndex: 1 }}>
                        <CloseIcon />
                    </IconButton>
                </Box >

                <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
                    <Stack spacing={3} mt={1}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Course ID"
                                    placeholder="e.g. CS101"
                                    value={courseForm.course_id}
                                    onChange={e => setCourseForm({ ...courseForm, course_id: e.target.value })}
                                    disabled={!!editingCourseId}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><FingerprintIcon color="primary" /></InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: 'white' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Instructor ID"
                                    placeholder="e.g. INS-001"
                                    value={courseForm.instructor_id}
                                    onChange={e => setCourseForm({ ...courseForm, instructor_id: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><PersonIcon color="primary" /></InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: 'white' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Course Title"
                                    placeholder="Enter a descriptive course name"
                                    value={courseForm.course_title}
                                    onChange={e => setCourseForm({ ...courseForm, course_title: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><SchoolIcon color="primary" /></InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: 'white' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    placeholder="Describe the course and what students will learn"
                                    multiline rows={4}
                                    value={courseForm.description}
                                    onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><DescriptionIcon color="primary" /></InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: 'white' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box>
                                    <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1.5, display: 'block', letterSpacing: '0.5px' }}>COURSE DIFFICULTY</Typography>
                                    <Stack direction="row" spacing={1}>
                                        {difficulties.map(d => (
                                            <Chip
                                                key={d}
                                                label={difficultyLabels[d]}
                                                onClick={() => setCourseForm({ ...courseForm, difficulty: d })}
                                                color={courseForm.difficulty === d ? difficultyColors[d] : 'default'}
                                                variant={courseForm.difficulty === d ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 700, borderRadius: 2 }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Total Capacity / Students"
                                    value={courseForm.student_strength}
                                    onChange={e => setCourseForm({ ...courseForm, student_strength: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><GroupIcon color="primary" /></InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: 'white' }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', justifyContent: 'space-between' }}>
                    <Button
                        onClick={() => { setOpenCourseForm(false); setEditingCourseId(null); }}
                        color="secondary"
                        variant="text"
                        sx={{ px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSaveCourse}
                        disabled={!courseForm.course_id || !courseForm.course_title}
                        startIcon={editingCourseId ? <EditIcon /> : <AddCircleOutlineIcon />}
                        sx={{ px: 5, py: 1.2 }}
                    >
                        {editingCourseId ? "Update Course" : "Create Course"}
                    </Button>
                </DialogActions>
            </Dialog >
        </Box >
    );
}
