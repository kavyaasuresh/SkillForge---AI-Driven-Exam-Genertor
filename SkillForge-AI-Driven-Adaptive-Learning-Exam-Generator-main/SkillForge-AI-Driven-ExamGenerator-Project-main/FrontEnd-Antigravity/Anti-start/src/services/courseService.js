/**
 * courseService.js
 *
 * Connected to Spring Boot Backend.
 * Returns the FULL updated list of courses after every mutation (Create, Update, Delete)
 * to simplify frontend state management.
 */
import axios from "axios";

// API Base URL - Change port if needed
const API_BASE_URL = "http://localhost:8081/api";

// Helper to get JWT token
const getAuthHeader = () => {
    const token = localStorage.getItem("skillforge_token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    };
};

export const courseService = {

    /**
     * GET all courses
     * Returns: Promise<Array> -> List of courses
     */
    async getCourses() {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/courses`,
                getAuthHeader()
            );
            return response.data || [];
        } catch (error) {
            console.error("Error fetching courses:", error);
            return [];
        }
    },
    async deleteCourse(courseId) {
        try {
            await axios.delete(`${API_BASE_URL}/courses/${courseId}`, getAuthHeader());
            return await this.getCourses(); // refresh UI
        } catch (error) {
            console.error("Error deleting course:", error);
            throw error;
        }
    },
    /**
     * CREATE or UPDATE course
     * Returns: Promise<Array> -> The updated list of all courses
     */
    async saveCourse(course, isUpdate) {
        try {
            if (isUpdate) {
                // UPDATE
                await axios.put(
                    `${API_BASE_URL}/courses/${course.course_id}`,
                    course,
                    getAuthHeader()
                );
            } else {
                // CREATE
                await axios.post(
                    `${API_BASE_URL}/courses`,
                    course,
                    getAuthHeader()
                );
            }
            // Return the updated list to refresh UI
            return await this.getCourses();
        } catch (error) {
            console.error("Error saving course:", error);
            throw error;
        }
    },

    /**
     * DELETE course
     * Returns: Promise<Array> -> The updated list of all courses
     */

    async deleteMaterial(materialId) {
        try {
            await axios.delete(`${API_BASE_URL}/materials/${materialId}`, getAuthHeader());
        } catch (error) {
            console.error("Error deleting material:", error);
            throw error;
        }
    },
    /**
     * ADD TOPIC
     * Returns: Promise<Array> -> The updated list of all courses
     */
    async saveTopic(course_id, topicIndex, topic) {
        try {
            // Backend expects POST /courses/{id}/topics
            // We ignore topicIndex as the backend handles ID assignment
            await axios.post(
                `${API_BASE_URL}/courses/${course_id}/topics`,
                topic,
                getAuthHeader()
            );
            return await this.getCourses();
        } catch (error) {
            console.error("Error saving topic:", error);
            throw error;
        }
    },

    /**
     * ADD MATERIAL
     * Returns: Promise<Array> -> The updated list of all courses
     */
    async addMaterial(material) {
        try {
            if (!material.topic || !material.topic.id) {
                throw new Error("Material must include topic.id");
            }

            const topicId = material.topic.id;

            const response = await axios.post(
                `${API_BASE_URL}/materials/topic/${topicId}`,
                {
                    title: material.title,
                    materialType: material.materialType,
                    contentUrl: material.contentUrl
                },
                getAuthHeader()
            );

            return response.data; // backend returns created material
        } catch (error) {
            console.error("Error adding material:", error);
            throw error;
        }
    },

    /**
 * GET materials by topic ID
 * Returns: Promise<Array>
 */
    async getMaterialsByTopic(topicId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/materials/topic/${topicId}`,
                getAuthHeader()
            );
            return response.data || [];
        } catch (error) {
            console.error("Error fetching materials:", error);
            throw error;
        }
    },

    /**
     * UPLOAD file as material
     * Uploads a file and creates a material entry
     * Returns: Promise<Object> -> The created material
     */
    async uploadMaterialFile(topicId, file, title, materialType) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('materialType', materialType);

            const token = localStorage.getItem("skillforge_token");

            const response = await axios.post(
                `${API_BASE_URL}/materials/topic/${topicId}/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error uploading material file:", error);
            // If upload endpoint doesn't exist, convert to base64 and store locally
            // This is a fallback for demo purposes
            return await this.uploadAsBase64(topicId, file, title, materialType);
        }
    },

    /**
     * Fallback: Convert file to base64 data URL
     * Used when backend upload endpoint is not available
     */
    async uploadAsBase64(topicId, file, title, materialType) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64Url = e.target.result;

                    // Store as material with base64 URL
                    const response = await axios.post(
                        `${API_BASE_URL}/materials/topic/${topicId}`,
                        {
                            title: title,
                            materialType: materialType,
                            contentUrl: base64Url
                        },
                        getAuthHeader()
                    );

                    resolve(response.data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

};