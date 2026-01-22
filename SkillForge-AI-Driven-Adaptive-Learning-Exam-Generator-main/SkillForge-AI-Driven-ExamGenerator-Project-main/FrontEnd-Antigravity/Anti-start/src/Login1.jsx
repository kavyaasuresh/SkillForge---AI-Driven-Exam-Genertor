import React, { useState } from "react";
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
    useTheme
} from "@mui/material";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaUser, FaSignInAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from 'react-router-dom';
import SchoolIcon from "@mui/icons-material/School";
import { authService } from "./services/authService";
import { useAuth } from "./context/AuthContext";

const toastOptions = {
    autoClose: 3000,
    theme: "colored",
    position: "top-right",
};

const Login1 = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { login } = useAuth();

    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validate = () => {
        const er = {};
        if (!data.email.trim()) er.email = "Email is required";
        if (!data.password.trim()) er.password = "Password required";
        setErrors(er);
        return Object.keys(er).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Fill all fields!", toastOptions);
            return;
        }

        setLoading(true);

        try {
            const result = await authService.login(data.email, data.password);
            // result = { token, email, role }

            login(result); // ✅ token exists now

            toast.success("Login Successful!", toastOptions);

            const userRole = result.role?.toUpperCase();
            if (userRole === "STUDENT") {
                navigate("/student/dashboard");
            } else if (userRole === "INSTRUCTOR") {
                navigate("/instructor/dashboard");
            } else if (userRole === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/pagenotfound");
            }
        } catch (error) {
            toast.error(error.message || "Server not reachable!", toastOptions);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Box sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            py: 4
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
                                    Welcome Back
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                                    Log in to continue your learning journey
                                </Typography>
                            </Box>
                        </Box>

                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="Email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={data.email}
                                        onChange={handleChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaUser size={20} color={errors.email ? theme.palette.error.main : theme.palette.text.secondary} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Your secret password"
                                        value={data.password}
                                        onChange={handleChange}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        InputProps={{
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
                                            startIcon={<FaSignInAlt />}
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
                                            {isLoading ? "Authenticating..." : "Sign In"}
                                        </Button>
                                    </Box>

                                    <Box textAlign="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Don’t have an account?{" "}
                                            <Link
                                                to="/register"
                                                style={{
                                                    color: theme.palette.primary.main,
                                                    textDecoration: 'none',
                                                    fontWeight: 700,
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                Create Account
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

export default Login1;
