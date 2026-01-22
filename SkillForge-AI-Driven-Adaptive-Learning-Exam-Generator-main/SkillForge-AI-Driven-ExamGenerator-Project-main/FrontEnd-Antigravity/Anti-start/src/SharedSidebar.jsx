import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
    Typography,
    Divider,
    Avatar,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    MenuBook as CoursesIcon,
    Quiz as QuizIcon,
    Logout as LogoutIcon,
    BarChart as BarChartIcon,
    Person as PersonIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useThemeMode } from './context/ThemeContext';

const drawerWidth = 280;

const SharedSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { mode, toggleTheme, isDark } = useThemeMode();

    const isStudent = user?.role === 'STUDENT';

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: isStudent ? '/student/dashboard' : '/instructor/dashboard' },
        { text: 'My Courses', icon: <CoursesIcon />, path: isStudent ? '/student/courses' : '/instructor/courses' },
        { text: 'Quizzes', icon: <QuizIcon />, path: isStudent ? '/student/quizzes' : '/instructor/quizzes' },
        { text: 'Performance', icon: <BarChartIcon />, path: isStudent ? '/student/performance' : '/instructor/performance-analytics' },
        { text: 'Profile', icon: <PersonIcon />, path: isStudent ? '/student/profile' : '/instructor/profile' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get display name - prefer fullName, then username
    const displayName = user?.fullName || user?.username || 'User';

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                },
            }}
        >
            {/* Logo Section */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}
                    >
                        SF
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        SkillForge
                    </Typography>
                </Box>
                {/* Theme Toggle */}
                <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
                    <IconButton
                        onClick={toggleTheme}
                        sx={{
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                            }
                        }}
                    >
                        {isDark ? <LightModeIcon sx={{ color: '#fbbf24' }} /> : <DarkModeIcon sx={{ color: '#64748b' }} />}
                    </IconButton>
                </Tooltip>
            </Box>

            {/* User Profile Section */}
            <Box sx={{ px: 3, py: 2 }}>
                <Box
                    onClick={() => navigate(isStudent ? '/student/profile' : '/instructor/profile')}
                    sx={{
                        p: 2,
                        borderRadius: '16px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor: 'primary.main',
                            width: 44,
                            height: 44,
                            fontWeight: 700
                        }}
                        src={user?.profilePic}
                    >
                        {getInitials(displayName)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {displayName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {isStudent ? 'Student' : 'Instructor'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Navigation Menu */}
            <Box sx={{ px: 3, py: 2, flex: 1 }}>
                <List disablePadding>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.text === 'My Courses' && location.pathname.includes('/courses'));

                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    selected={isActive}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.5,
                                        '&.Mui-selected': {
                                            bgcolor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                                            color: 'primary.main',
                                            '& .MuiListItemIcon-root': {
                                                color: 'primary.main',
                                            },
                                            '&:hover': {
                                                bgcolor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.12)',
                                            }
                                        },
                                        '&:hover': {
                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 700 : 500,
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Logout Button */}
            <Box sx={{ p: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: '12px',
                        color: '#ef4444',
                        '&:hover': {
                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: '#ef4444' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Drawer>
    );
};

export default SharedSidebar;