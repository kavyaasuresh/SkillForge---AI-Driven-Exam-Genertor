import React from 'react';
import { CssBaseline, Box, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CourseList from './CourseList';
import MainLayout from './MainLayout';
import InstructorDashboard from './InstructorDashboard';
import Login1 from './Login1';
import Register1 from './Register1';
import { courseService } from './services/courseService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { ThemeProvider } from './context/ThemeContext';
import StudentDashboard from './StudentDashboard';
import QuizSection from './QuizSection';
import QuizAttempt from './QuizAttempt';
import InstructorGradingView from './InstructorGradingView';
import CourseMaterials from './CourseMaterials';
import StudentCourseList from './StudentCourseList';
import InstructorQuizManager from './InstructorQuizManager';
import QuizAnalyticsDashboard from './QuizAnalyticsDashboard';
import InstructorGradingHub from './InstructorGradingHub';
import QuizTestPage from './QuizTestPage';
import QuizResult from './QuizResult';
import PerformanceAnalyticsDashboard from './PerformanceAnalyticsDashboard';
import StudentDetailedView from './StudentDetailedView';
import StudentPerformance from './StudentPerformance';
import ProfilePage from './ProfilePage';




// ------------------- PRIVATE ROUTE -------------------
const PrivateRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    const isAuthenticated = !!user?.token; // check if token exists

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role?.toUpperCase())) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// ------------------- APP -------------------
function App() {
    const [courses, setCourses] = React.useState([]);

    React.useEffect(() => {
        const fetchInitialData = async () => {
            const data = await courseService.getCourses();
            setCourses(data);
        };
        fetchInitialData();
    }, []);

    return (
        <ThemeProvider>
            <CssBaseline />
            <AuthProvider>
                <StudentProvider>
                    <Router>
                        <Routes>
                            {/* -------- Public -------- */}
                            <Route path="/register" element={<Register1 />} />
                            <Route path="/login" element={<Login1 />} />

                            {/* -------- Authenticated Layout -------- */}
                            <Route element={<MainLayout />}>

                                {/* -------- Student Profile -------- */}
                                <Route
                                    path="/student/profile"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <ProfilePage />
                                        </PrivateRoute>
                                    }
                                />

                                {/* -------- Instructor Profile -------- */}
                                <Route
                                    path="/instructor/profile"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <ProfilePage />
                                        </PrivateRoute>
                                    }
                                />



                                {/* -------- Student -------- */}
                                <Route
                                    path="/student/dashboard"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <StudentDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/student/courses"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <StudentCourseList />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/student/course/:courseId"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <StudentCourseList />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/student/quizzes"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <QuizSection />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/student/quiz/:quizId"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <QuizAttempt />
                                        </PrivateRoute>
                                    }
                                />

                                <Route
                                    path="/student/quiz/:quizId/result"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <QuizResult />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/student/performance"
                                    element={
                                        <PrivateRoute allowedRoles={['STUDENT']}>
                                            <StudentPerformance />
                                        </PrivateRoute>
                                    }
                                />

                                {/* -------- Instructor -------- */}
                                <Route
                                    path="/instructor/quiz-manager/:courseId/:topicId"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <InstructorQuizManager />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/dashboard"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <InstructorDashboard courses={courses} />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/courses"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <CourseList courses={courses} setCourses={setCourses} />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/status"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <Box p={4}><Typography variant="h4">Course Status (Coming Soon)</Typography></Box>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/announce"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <Box p={4}><Typography variant="h4">Announcements (Coming Soon)</Typography></Box>
                                        </PrivateRoute>
                                    }
                                />

                                {/* -------- Quiz Analytics & Management -------- */}
                                <Route
                                    path="/instructor/quizzes"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <QuizAnalyticsDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/course/:courseId/topic/:topicId/quiz/analytics"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <QuizAnalyticsDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/course/:courseId/topic/:topicId/quiz/create"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <InstructorQuizManager />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/course/:courseId/topic/:topicId/quiz/edit/:quizId"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <InstructorQuizManager />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/course/:courseId/materials"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <CourseMaterials />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/quiz-test"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <QuizTestPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/grading/:attemptId"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <InstructorGradingView />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/grading-hub"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <InstructorGradingHub />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/performance-analytics"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <PerformanceAnalyticsDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/instructor/student/:studentId/analytics"
                                    element={
                                        <PrivateRoute allowedRoles={['INSTRUCTOR']}>
                                            <StudentDetailedView />
                                        </PrivateRoute>
                                    }
                                />

                                {/* -------- Admin -------- */}
                                <Route
                                    path="/admin/dashboard"
                                    element={
                                        <PrivateRoute allowedRoles={['ADMIN']}>
                                            <Box p={4}><Typography variant="h4">Admin Dashboard (Coming Soon)</Typography></Box>
                                        </PrivateRoute>
                                    }
                                />
                            </Route>
                            {/* -------- Default / Not Found -------- */}
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </Router>
                </StudentProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
export default App;
