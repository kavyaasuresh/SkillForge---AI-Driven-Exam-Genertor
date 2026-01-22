import axios from "axios";

const BASE_URL = "http://localhost:8081/quiz/result";

const getAuthHeader = () => {
    const token = localStorage.getItem("skillforge_token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    };
};

export const getQuickResultByQuiz = async (quizId) => {
    console.log(`[RESULT_SERVICE] Fetching Quick Result for Quiz ID: ${quizId}`);
    try {
        const response = await axios.get(
            `${BASE_URL}/quick/student/${quizId}`,
            getAuthHeader()
        );
        console.log("[RESULT_SERVICE] Quick Result Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("[RESULT_SERVICE] Error fetching quick result:", error.response || error);
        throw error;
    }
};

export const getFullSummaryByQuiz = async (quizId) => {
    console.log(`[RESULT_SERVICE] Fetching Full Summary for Quiz ID: ${quizId}`);
    try {
        const response = await axios.get(
            `${BASE_URL}/summary/student/${quizId}`,
            getAuthHeader()
        );
        console.log("[RESULT_SERVICE] Full Summary Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("[RESULT_SERVICE] Error fetching full summary:", error.response || error);
        throw error;
    }
};
