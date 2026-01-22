import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('skillforge_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Analytics Service
 * Provides comprehensive performance analytics for instructors
 * All methods include detailed console logging for debugging
 */
const analyticsService = {
    /**
     * Get course-wise student performance distribution
     * Shows how students performed across different courses
     */
    getCoursePerformance: async () => {
        console.log('📤 [Analytics API] Fetching course-wise student performance');

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/course-performance`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received course performance data:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching course performance:', error);
            return [];
        }
    },

    /**
     * Get topic-wise performance across all courses
     * Shows average scores for each topic
     */
    getTopicPerformance: async () => {
        console.log('📤 [Analytics API] Fetching topic-wise performance');

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/topic-performance`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received topic performance data:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching topic performance:', error);
            return [];
        }
    },

    /**
     * Get adaptive skill progression over time
     * Shows how student performance changes as difficulty increases
     */
    getSkillProgression: async () => {
        console.log('📤 [Analytics API] Fetching adaptive skill progression');

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/skill-progression`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received skill progression data:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching skill progression:', error);
            return [];
        }
    },
    
    /**
     * Get daily student involvement
     */
    getDailyStudentInvolvement: async () => {
        console.log('📤 [Analytics API] Fetching daily student involvement');

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/daily-involvement`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received daily involvement data:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching daily involvement:', error);
            return [];
        }
    },
    
    /**
     * Get student performance for a specific course
     */
    getStudentPerformanceByCourse: async (courseName) => {
        console.log('📤 [Analytics API] Fetching student performance for course:', courseName);

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/course/${encodeURIComponent(courseName)}/students`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received course student data:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching course student data:', error);
            return [];
        }
    },
    
    /**
     * Get overall course performance
     */
    getOverallCoursePerformance: async () => {
        console.log('📤 [Analytics API] Fetching overall course performance');

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/overall-course-performance`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received overall course performance:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching overall course performance:', error);
            return [];
        }
    },

    /**
     * Get student-quiz scores table data
     * Supports filtering by course, topic, and difficulty
     */
    getStudentQuizScores: async (filters = {}) => {
        console.log('📤 [Analytics API] Fetching student-quiz scores', filters);

        try {
            const params = new URLSearchParams();
            if (filters.studentName) params.append('studentName', filters.studentName);
            if (filters.topicId) params.append('topic', filters.topicId);
            if (filters.difficulty) params.append('difficulty', filters.difficulty);

            const response = await axios.get(`${API_BASE_URL}/analytics/student-quiz-scores?${params.toString()}`, {
                headers: getAuthHeader()
            });

            console.log('📥 Received student-quiz scores:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching student-quiz scores:', error);
            return [];
        }
    },

    /**
     * Get detailed analytics for a specific student
     * Includes course performance, topic performance, activity metrics, and recent attempts
     */
    getStudentDetailedAnalytics: async (studentId) => {
        console.log('📤 [Analytics API] Fetching detailed analytics for student:', studentId);

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/student/${studentId}/detailed`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received detailed student analytics:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching detailed student analytics:', error);
            return {
                studentInfo: { id: studentId, name: 'Unknown', email: '' },
                coursePerformance: [],
                topicPerformance: [],
                activityMetrics: { totalAssigned: 0, totalAttempted: 0, completionRate: 0 },
                recentAttempts: []
            };
        }
    },

    /**
     * Get all students with basic information
     * Returns list of students with id, name, and email
     */
    getAllStudents: async () => {
        console.log('📤 [Analytics API] Fetching all students');

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/students`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received all students:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching all students:', error);
            return [];
        }
    },

    /**
     * Get current student's own performance analytics
     * Uses authentication to fetch only their own data
     */
    getMyPerformance: async () => {
        console.log('📤 [Analytics API] Fetching my performance');

        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/my-performance`, {
                headers: getAuthHeader()
            });

            console.log('📥 [Analytics API] Received my performance:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [Analytics API] Error fetching my performance:', error);
            return {
                studentInfo: { id: 0, name: 'Unknown', email: '' },
                coursePerformance: [],
                topicPerformance: [],
                activityMetrics: { totalAssigned: 0, totalAttempted: 0, completionRate: 0 },
                recentAttempts: []
            };
        }
    }
};

export default analyticsService;
