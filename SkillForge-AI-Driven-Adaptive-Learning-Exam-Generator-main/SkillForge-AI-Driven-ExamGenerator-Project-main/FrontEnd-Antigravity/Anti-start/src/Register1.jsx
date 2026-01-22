import React, { useState } from 'react';
import {
    Box,
    Container,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Fade,
    Stack,
    Checkbox,
    FormControlLabel,
    MenuItem,
    useTheme
} from '@mui/material';
import { FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaLock, FaUser, FaEnvelope } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import SchoolIcon from "@mui/icons-material/School";
import { authService } from "./services/authService";

const toastOptions = {
    autoClose: 3000,
    theme: 'colored',
    position: 'top-right'
};

const Register1 = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const clearName = () => {
        setData(prev => ({ ...prev, name: '' }));
        toast.info('Name cleared!', toastOptions);
    };

    const validate = () => {
        const er = {};

        if (!data.name.trim()) er.name = 'Full name is required';

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(data.email)) er.email = 'Please enter a valid email';

        if (data.password.length < 6)
            er.password = 'Password must be at least 6 characters';

        setErrors(er);
        return Object.keys(er).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Fix the errors.', toastOptions);
            return;
        }

        setIsLoading(true);

        try {
            await authService.register({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role
            });

            toast.success("Registration Successful!", toastOptions);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.message, toastOptions);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            py: 6,
            px: 2
        }}>
            <Fade in timeout={800}>
                <Container maxWidth="sm">
                    <Card sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        {/* Header Gradient Section */}
                        <Box sx={{
                            background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
                            p: 4,
                            color: 'white',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative Elements */}
                            <Box sx={{
                                position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                                borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
                            }} />
                            <Box sx={{
                                position: 'absolute', bottom: -20, left: -20, width: 80, height: 80,
                                borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
                            }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
                                <Box sx={{
                                    p: 1.5, borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(4px)',
                                    mb: 2,
                                    display: 'flex'
                                }}>
                                    <SchoolIcon sx={{ fontSize: 32 }} />
                                </Box>
                                <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                                    Create Account
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                                    Join SkillForge and start your learning adventure
                                </Typography>
                            </Box>
                        </Box>

                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="Name"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={data.name}
                                        onChange={handleChange}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaUser size={20} color={errors.name ? theme.palette.error.main : theme.palette.text.secondary} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <TextField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={data.email}
                                        onChange={handleChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaEnvelope size={20} color={errors.email ? theme.palette.error.main : theme.palette.text.secondary} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        select
                                        label="Role"
                                        name="role"
                                        value={data.role}
                                        onChange={handleChange}
                                        fullWidth
                                    >
                                        <MenuItem value="STUDENT">Student</MenuItem>
                                        <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                                        <MenuItem value="ADMIN">Admin</MenuItem>
                                    </TextField>

                                    <TextField
                                        label="Password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={data.password}
                                        onChange={handleChange}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaLock size={20} color={errors.password ? theme.palette.error.main : theme.palette.text.secondary} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        size="small"
                                                    >
                                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Box sx={{ mt: 1 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={isLoading}
                                            sx={{
                                                py: 2,
                                                borderRadius: 2.5,
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
                                                '&:hover': {
                                                    boxShadow: '0 12px 20px -4px rgba(99, 102, 241, 0.5)',
                                                }
                                            }}
                                        >
                                            {isLoading ? "Signing up..." : "Create Account"}
                                        </Button>
                                    </Box>

                                    <Box textAlign="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Already have an account?{" "}
                                            <Link
                                                to="/login"
                                                style={{
                                                    color: theme.palette.primary.main,
                                                    textDecoration: 'none',
                                                    fontWeight: 700,
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                Sign In
                                            </Link>
                                        </Typography>
                                    </Box>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Container>
            </Fade>
            <ToastContainer />
        </Box>
    );
};

export default Register1;
