import axios from "axios";

const API_BASE_URL = "http://localhost:8081/student";

const getAuthHeader = () => {
    const token = localStorage.getItem("skillforge_token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    };
};

export const quizService = {
    async getAllQuizzes() {
        const response = await axios.get("http://localhost:8081/api/instructor/quiz/all", getAuthHeader());
        return response.data || [];
    },

    async getQuizAnalytics(quizId) {
        // Use working instructor endpoint
        const response = await axios.get(`http://localhost:8081/api/instructor/quiz/${quizId}`, getAuthHeader());
        return response.data;
    },

    async getQuizById(quizId) {
        const response = await axios.get(`http://localhost:8081/api/instructor/quiz/${quizId}`, getAuthHeader());
        return response.data;
    },

    async getPendingManualReviews() {
        const response = await axios.get(`http://localhost:8081/api/instructor/analytics/pending-reviews`, getAuthHeader());
        return response.data || [];
    },

    async getAttemptReview(attemptId) {
        const response = await axios.get(`http://localhost:8081/api/instructor/analytics/review/${attemptId}`, getAuthHeader());
        return response.data;
    }
};