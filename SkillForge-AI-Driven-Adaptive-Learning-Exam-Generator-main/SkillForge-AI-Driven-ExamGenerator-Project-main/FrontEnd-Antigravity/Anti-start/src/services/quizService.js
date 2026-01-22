import axios from "axios";

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

    async getAssignedQuizzes() {
        const response = await axios.get("http://localhost:8081/student/quizzes", getAuthHeader());
        return response.data || [];
    },

    async getQuizAnalytics(quizId) {
        try {
            // First try to get detailed analytics from backend
            const response = await axios.get(`http://localhost:8081/api/instructor/quiz/${quizId}/analytics`, getAuthHeader());
            return response.data;
        } catch (error) {
            console.warn(`Analytics API failed for quiz ${quizId}, falling back to basic data`);

            // Fallback: Return the quiz data from getAllQuizzes
            const allQuizzes = await this.getAllQuizzes();
            const quiz = allQuizzes.find(q =>
                Number(q.quizId) === Number(quizId) ||
                Number(q.id) === Number(quizId)
            );

            if (quiz) {
                return {
                    ...quiz,
                    questions: quiz.questions || [],
                    assignedStudents: quiz.assignedStudents || [],
                    attempts: quiz.attempts || [],
                    totalAssigned: quiz.assignedStudents?.length || 0,
                    totalAttempted: quiz.attempts?.length || 0
                };
            }

            throw new Error(`Quiz ${quizId} not found`);
        }
    },

    async getPendingManualReviews() {
        try {
            const response = await axios.get(`http://localhost:8081/api/instructor/analytics/pending-reviews`, getAuthHeader());
            return response.data || [];
        } catch (error) {
            return [];
        }
    },

    async getAttemptReview(attemptId) {
        const response = await axios.get(`http://localhost:8081/api/instructor/analytics/review/${attemptId}`, getAuthHeader());
        return response.data;
    },

    async getRegisteredStudents() {
        const response = await axios.get(`http://localhost:8081/api/instructor/students`, getAuthHeader());
        return response.data || [];
    },

    async createAndAssignQuiz(quizData) {
        const response = await axios.post("http://localhost:8081/api/instructor/quiz/create", quizData, getAuthHeader());
        return response.data;
    },

    async updateQuiz(quizId, quizData) {
        const response = await axios.put(`http://localhost:8081/api/instructor/quiz/${quizId}`, quizData, getAuthHeader());
        return response.data;
    },

    async deleteQuiz(quizId) {
        const response = await axios.delete(`http://localhost:8081/api/instructor/quiz/${quizId}`, getAuthHeader());
        return response.data;
    },

    async getQuizDetails(quizId) {
        const response = await axios.get(`http://localhost:8081/api/instructor/quiz/${quizId}`, getAuthHeader());
        return response.data;
    },

    async getStudentQuiz(quizId) {
        const response = await axios.get(`http://localhost:8081/student/quiz/${quizId}`, getAuthHeader());
        return response.data;
    },

    async getQuizById(quizId) {
        return this.getStudentQuiz(quizId);
    },

    // 🔹 Added for Grading View
    async getStudentAttemptMeta(attemptId) {
        return this.getAttemptReview(attemptId);
    },

    async submitGrade(responseId, marks) {
        const response = await axios.put(`http://localhost:8081/api/instructor/evaluation/${responseId}`, { marks }, getAuthHeader());
        return response.data;
    },

    async submitAttemptGrades(attemptId, payload) {
        const response = await axios.post(`http://localhost:8081/api/instructor/analytics/review/${attemptId}`, payload, getAuthHeader());
        return response.data;
    },

    // 🔹 Added for Student Quiz Attempt
    async getQuestionsByQuizId(quizId) {
        const response = await axios.get(`http://localhost:8081/student/quiz/${quizId}/questions`, getAuthHeader());
        return response.data || [];
    },

    async submitQuizAttempt(quizId, answers) {
        const response = await axios.post(`http://localhost:8081/student/quiz/${quizId}/submit`, answers, getAuthHeader());
        return response.data;
    },

    async retakeQuiz(quizId) {
        await axios.post(`http://localhost:8081/student/quiz/${quizId}/retake`, {}, getAuthHeader());
    },

    async getStudentLatestAttempt(quizId) {
        // Fallback or specific endpoint if exists
        try {
            const response = await axios.get(`http://localhost:8081/api/instructor/quiz/${quizId}/analytics`, getAuthHeader());
            // Find the latest attempt for the current student in the analytics
            // (This is a bit of a hack but works if the specific endpoint is missing)
            return response.data.attempts?.[0] || {};
        } catch (error) {
            return {};
        }
    }
};