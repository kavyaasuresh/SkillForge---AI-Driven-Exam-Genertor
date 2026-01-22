import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext(null);

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('skillforge_theme');
        return savedMode || 'light';
    });

    useEffect(() => {
        localStorage.setItem('skillforge_theme', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light mode
                            primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#ffffff' },
                            secondary: { main: '#64748b', light: '#94a3b8', dark: '#334155', contrastText: '#ffffff' },
                            background: { default: '#f5f7fb', paper: '#ffffff' },
                            text: { primary: '#111827', secondary: '#4b5563' },
                            divider: '#f1f5f9',
                        }
                        : {
                            // Dark mode
                            primary: { main: '#818cf8', light: '#a5b4fc', dark: '#6366f1', contrastText: '#ffffff' },
                            secondary: { main: '#94a3b8', light: '#cbd5e1', dark: '#64748b', contrastText: '#ffffff' },
                            background: { default: '#0f172a', paper: '#1e293b' },
                            text: { primary: '#f1f5f9', secondary: '#94a3b8' },
                            divider: '#334155',
                        }),
                },
                shape: { borderRadius: 12 },
                typography: { fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif' },
                components: {
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    const value = useMemo(
        () => ({
            mode,
            toggleTheme,
            isDark: mode === 'dark',
        }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
