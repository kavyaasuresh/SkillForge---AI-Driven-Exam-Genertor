import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { courseService } from '../services/courseService';
import { quizService } from '../services/quizService';

const StudentContext = createContext();

export const useStudent = () => useContext(StudentContext);

export const StudentProvider = ({ children }) => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState({
        enrolledCourses: [],
        quizzes: [],
        stats: {
            completedQuizzes: 0,
            averageScore: 0,
            coursesInProgress: 0
        }
    });
    const [loading, setLoading] = useState(false);

    const refreshStudentData = async () => {
        if (!user || user.role !== 'STUDENT') return;

        setLoading(true);
        try {
            // Fetch real courses
            const allCourses = await courseService.getCourses();

            // Normalize course data to include both field naming conventions
            const normalizedCourses = allCourses.map(course => ({
                ...course,
                // Add 'title' for components expecting it, fallback to course_title from backend
                title: course.title || course.course_title || 'Untitled Course',
                // Normalize topics as well
                topics: (course.topics || []).map(topic => ({
                    ...topic,
                    title: topic.title || topic.name,
                    name: topic.name || topic.title
                }))
            }));

            // Personalized Quizzes
            let personalizedQuizzes = [];
            try {
                const assigned = await quizService.getAssignedQuizzes();
                personalizedQuizzes = assigned.map(q => ({
                    ...q,
                    quiz_id: q.quizId || q.quiz_id || q.id, // Support backend quizId
                    status: q.status || 'ASSIGNED',
                    total_marks: q.totalMarks || q.total_marks || 100, // Support backend totalMarks
                    time_limit: q.timeLimit || q.time_limit || 30 // Support backend timeLimit
                }));
            } catch (e) {
                console.error("Could not fetch any quizzes from backend", e);
                personalizedQuizzes = [];
            }

            const completed = personalizedQuizzes.filter(q => {
                console.log('Quiz status check:', q.status, q);
                return q.status === 'ATTEMPTED' || q.status === 'COMPLETED' || q.status === 'SUBMITTED';
            });
            
            console.log('All quizzes:', personalizedQuizzes);
            console.log('Completed quizzes:', completed);
            
            const avgScore = completed.length > 0
                ? Math.round(completed.reduce((acc, curr) => {
                    const score = curr.score || curr.percentage || curr.marks || 0;
                    console.log('Quiz score:', score, curr);
                    return acc + score;
                }, 0) / completed.length)
                : 0;

            console.log('Calculated stats:', {
                completedQuizzes: completed.length,
                averageScore: avgScore
            });

            setStudentData({
                enrolledCourses: normalizedCourses,
                quizzes: personalizedQuizzes,
                stats: {
                    completedQuizzes: completed.length,
                    averageScore: avgScore,
                    coursesInProgress: normalizedCourses.length
                }
            });
        } catch (error) {
            console.error("Error refreshing student data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshStudentData();
    }, [user]);

    return (
        <StudentContext.Provider value={{ studentData, setStudentData, refreshStudentData, loading }}>
            {children}
        </StudentContext.Provider>
    );
};
