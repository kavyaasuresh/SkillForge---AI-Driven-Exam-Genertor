import React from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Divider,
    Stack,
    alpha,
    useTheme,
    Fade,
    Avatar,
    IconButton,
    Paper,
    Grid
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CampaignIcon from "@mui/icons-material/Campaign";
import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import QuizIcon from "@mui/icons-material/Quiz";

const InstructorDashboard = ({ courses }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { user, logout } = useAuth();

    // Get display name
    const displayName = user?.fullName || user?.username || 'Instructor';
    const getInitials = (name) => {
        if (!name) return 'IN';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const navItems = [
        { label: "Dashboard", icon: <DashboardIcon />, path: "/instructor/dashboard" },
        { label: "Courses", icon: <SchoolIcon />, path: "/instructor/courses" },
        { label: "Quizzes", icon: <QuizIcon />, path: "/instructor/quizzes" },
    ];

    const stats = [
        {
            label: "Total Courses",
            value: courses.length,
            subtext: "Courses created by you",
            icon: <SchoolIcon sx={{ fontSize: 32 }} />,
            color: "#2563eb",
            bg: alpha("#2563eb", 0.1)
        },
        {
            label: "Active Students",
            value: courses.reduce((acc, c) => acc + parseInt(c.student_strength || 0), 0),
            subtext: "Learners currently enrolled",
            icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
            color: "#16a34a",
            bg: alpha("#16a34a", 0.1)
        }
    ];

    return (
        <Box>



            {/* ================= MAIN CONTENT ================= */}
            <Box sx={{ flex: 1 }}>

                {/* Top bar with Profile/Notifications */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 5, gap: 2 }}>
                    <IconButton sx={{ bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <NotificationsIcon size="small" />
                    </IconButton>
                    <IconButton sx={{ bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <SettingsIcon size="small" />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="800">{displayName}</Typography>
                            <Typography variant="caption" color="text.secondary">Instructor</Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>{getInitials(displayName)}</Avatar>
                    </Box>
                </Box>

                <Fade in timeout={800}>
                    <Box>
                        {/* Welcome Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                borderRadius: 5,
                                padding: 5,
                                mb: 5,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.4),
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.03) }} />
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1, color: '#0f172a' }}>
                                    Welcome back, {displayName} 👋
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: 600 }}>
                                    Here’s a snapshot of your teaching space. Your students are making great progress today!
                                </Typography>
                                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                    <Button variant="contained" size="large" onClick={() => navigate('/instructor/courses')} sx={{ px: 4, borderRadius: 3, fontWeight: 800 }}>Manage Courses</Button>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Stats Cards */}
                        <Grid container spacing={4} sx={{ mb: 5 }}>
                            {stats.map((stat, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Card sx={{
                                        borderRadius: 5,
                                        border: '1px solid transparent',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'default',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                                            borderColor: alpha(stat.color, 0.2)
                                        }
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                <Box sx={{ p: 2, bgcolor: stat.bg, color: stat.color, borderRadius: 4, display: 'flex' }}>
                                                    {stat.icon}
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a' }}>
                                                    <TrendingUpIcon size="small" />
                                                    <Typography variant="caption" fontWeight="800">+12%</Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.secondary' }}>
                                                {stat.label}
                                            </Typography>
                                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                {stat.subtext}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Focus Section & Recent Activity Removed */}
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
};

export default InstructorDashboard;