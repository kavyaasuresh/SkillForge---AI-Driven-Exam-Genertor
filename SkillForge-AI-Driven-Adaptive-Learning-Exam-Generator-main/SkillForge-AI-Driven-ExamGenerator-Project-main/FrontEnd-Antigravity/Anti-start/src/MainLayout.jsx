import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SharedSidebar from './SharedSidebar';
import { useThemeMode } from './context/ThemeContext';

const MainLayout = () => {
    const { isDark } = useThemeMode();

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: 'background.default',
            transition: 'background-color 0.3s ease'
        }}>
            <SharedSidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 280px)` },
                    minHeight: '100vh'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
