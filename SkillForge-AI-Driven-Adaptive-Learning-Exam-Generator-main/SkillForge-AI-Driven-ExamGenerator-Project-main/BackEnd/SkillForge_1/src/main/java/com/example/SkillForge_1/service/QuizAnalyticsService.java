//
//package com.example.SkillForge_1.service;
//
//import com.example.SkillForge_1.dto.*;
//import com.example.SkillForge_1.model.*;
//import com.example.SkillForge_1.repository.*;
//
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//@Transactional(readOnly = true)
//public class QuizAnalyticsService {
//
//    private final QuizRepository quizRepository;
//    private final QuizQuestionRepository questionRepository;
//    private final StudentQuizAssignmentRepository assignmentRepository;
//    private final StudentQuizAttemptRepository attemptRepository;
//    private final StudentRepository studentRepository;
//
//    public QuizAnalyticsService(
//            QuizRepository quizRepository,
//            QuizQuestionRepository questionRepository,
//            StudentQuizAssignmentRepository assignmentRepository,
//            StudentQuizAttemptRepository attemptRepository,
//            StudentRepository studentRepository
//    ) {
//        this.quizRepository = quizRepository;
//        this.questionRepository = questionRepository;
//        this.assignmentRepository = assignmentRepository;
//        this.attemptRepository = attemptRepository;
//        this.studentRepository = studentRepository;
//    }
//
//    // =====================================================
//    // QUIZ ANALYTICS (Instructor Dashboard)
//    // =====================================================
//    public QuizAnalyticsDTO getQuizAnalytics(Long quizId) {
//
//        Quiz quiz = quizRepository.findById(quizId)
//                .orElseThrow(() -> new RuntimeException("Quiz not found"));
//
//        // ---------------- QUESTIONS ----------------
//        List<QuizQuestionDTO> questions =
//                questionRepository.findByQuiz_QuizId(quizId)
//                        .stream()
//                        .map(q -> {
//                            QuizQuestionDTO dto = new QuizQuestionDTO();
//                            dto.setQuestionId(q.getQuestionId());
//                            dto.setQuestionText(q.getQuestion());
//                            dto.setOptions(List.of(
//                                    q.getOptionA(),
//                                    q.getOptionB(),
//                                    q.getOptionC(),
//                                    q.getOptionD()
//                            ));
//                            dto.setCorrectAnswer(q.getCorrectAnswer());
//                            return dto;
//                        })
//                        .collect(Collectors.toList());
//
//        // ---------------- COUNTS ----------------
//        int totalAssigned = assignmentRepository.countByQuiz_QuizId(quizId);
//        int totalAttempted = attemptRepository.countByQuiz_QuizId(quizId);
//
//        QuizAnalyticsDTO dto = new QuizAnalyticsDTO();
//        dto.setQuizId(quiz.getQuizId());
//        dto.setTitle(quiz.getTitle());
//        dto.setDifficulty(quiz.getDifficulty());
//        dto.setTotalMarks(quiz.getTotalMarks());
//        dto.setQuestions(questions);
//        dto.setTotalAssigned(totalAssigned);
//        dto.setTotalAttempted(totalAttempted);
//
//        return dto;
//    }
//
//    // =====================================================
//    // STUDENT ATTEMPTS PER QUIZ
//    // =====================================================
//    public List<StudentAttemptDTO> getQuizAttempts(Long quizId) {
//
//        Quiz quiz = quizRepository.findById(quizId)
//                .orElseThrow(() -> new RuntimeException("Quiz not found"));
//
//        List<StudentQuizAssignment> assignments =
//                assignmentRepository.findByQuiz_QuizId(quizId);
//
//        return assignments.stream().map(assignment -> {
//
//            Long studentId = assignment.getStudent().getId();
//
//            StudentAttemptDTO dto = new StudentAttemptDTO();
//            dto.setStudentId(studentId);
//
//            Optional<Student> studentOpt = studentRepository.findById(studentId);
//            dto.setStudentName(
//                    studentOpt.map(s -> s.getUser().getName())
//                            .orElse("Student " + studentId)
//            );
//
//            boolean attempted =
//                    attemptRepository.existsByStudent_IdAndQuiz_QuizId(studentId, quizId);
//
//            dto.setCompleted(attempted);
//
//            if (attempted) {
//                Optional<StudentQuizAttempt> attempt =
//                        attemptRepository.findAll()
//                                .stream()
//                                .filter(a ->
//                                        a.getStudent().getId().equals(studentId) &&
//                                                a.getQuiz().getQuizId().equals(quizId))
//                                .findFirst();
//            } else {
//                dto.setScore(0);
//            }
//
//            return dto;
//        }).collect(Collectors.toList());
//    }
//
//    // =====================================================
//    // QUIZ DETAILS (Edit / Review Page)
//    // =====================================================
//    public QuizAnalyticsDTO getQuizDetails(Long quizId) {
//
//        Quiz quiz = quizRepository.findById(quizId)
//                .orElseThrow(() -> new RuntimeException("Quiz not found"));
//
//        List<QuizQuestionDTO> questions =
//                questionRepository.findByQuiz_QuizId(quizId)
//                        .stream()
//                        .map(q -> {
//                            QuizQuestionDTO dto = new QuizQuestionDTO();
//                            dto.setQuestionId(q.getQuestionId());
//                            dto.setQuestionText(q.getQuestion());
//                            dto.setOptions(List.of(
//                                    q.getOptionA(),
//                                    q.getOptionB(),
//                                    q.getOptionC(),
//                                    q.getOptionD()
//                            ));
//                            dto.setCorrectAnswer(q.getCorrectAnswer());
//                            return dto;
//                        })
//                        .collect(Collectors.toList());
//
//        QuizAnalyticsDTO dto = new QuizAnalyticsDTO();
//        dto.setQuizId(quiz.getQuizId());
//        dto.setTitle(quiz.getTitle());
//        dto.setDifficulty(quiz.getDifficulty());
//        dto.setTotalMarks(quiz.getTotalMarks());
//        dto.setQuestions(questions);
//
//        return dto;
//    }
//}
package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.*;
import com.example.SkillForge_1.model.*;
import com.example.SkillForge_1.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class QuizAnalyticsService {

    private final QuizRepository quizRepository;
    private final StudentQuizAssignmentRepository assignmentRepository;
    private final StudentQuizAttemptRepository attemptRepository;
    private final StudentRepository studentRepository;
    private final QuizQuestionRepository questionRepository;

    public QuizAnalyticsService(
            QuizRepository quizRepository,
            StudentQuizAssignmentRepository assignmentRepository,
            StudentQuizAttemptRepository attemptRepository,
            StudentRepository studentRepository,
            QuizQuestionRepository questionRepository
    ) {
        this.quizRepository = quizRepository;
        this.assignmentRepository = assignmentRepository;
        this.attemptRepository = attemptRepository;
        this.studentRepository = studentRepository;
        this.questionRepository = questionRepository;
    }

    // =====================================================
    // QUIZ ANALYTICS (Instructor Dashboard)
    // =====================================================
    public QuizAnalyticsDTO getQuizAnalytics(Long quizId) {
        try {
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            // ---------------- QUESTIONS ----------------
            List<QuizQuestionDTO> questionDTOs = new java.util.ArrayList<>();
            try {
                questionDTOs = questionRepository.findByQuiz_QuizId(quizId)
                        .stream()
                        .map(q -> {
                            QuizQuestionDTO dto = new QuizQuestionDTO();
                            dto.setQuestionId(q.getQuestionId());
                            dto.setQuestionText(q.getQuestion());
                            dto.setQuestionType(q.getType());
                            
                            List<String> options = new java.util.ArrayList<>();
                            if (q.getOptionA() != null) options.add(q.getOptionA());
                            if (q.getOptionB() != null) options.add(q.getOptionB());
                            if (q.getOptionC() != null) options.add(q.getOptionC());
                            if (q.getOptionD() != null) options.add(q.getOptionD());
                            dto.setOptions(options);
                            
                            dto.setCorrectAnswer(q.getCorrectAnswer());
                            return dto;
                        })
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error loading questions for quiz " + quizId + ": " + e.getMessage());
            }

            // ---------------- ASSIGNED STUDENTS ----------------
            List<AssignedStudentDTO> assignedStudents = new java.util.ArrayList<>();
            try {
                assignedStudents = assignmentRepository.findByQuiz_QuizId(quizId)
                        .stream()
                        .map(a -> {
                            try {
                                Student student = a.getStudent();
                                if (student == null) return null;
                                String name = student.getUser() != null ? student.getUser().getName() : "Unknown";
                                return new AssignedStudentDTO(student.getId(), name);
                            } catch (Exception e) {
                                System.err.println("Error processing assigned student: " + e.getMessage());
                                return null;
                            }
                        })
                        .filter(dto -> dto != null)
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error loading assigned students for quiz " + quizId + ": " + e.getMessage());
            }

            // ---------------- ATTEMPTS ----------------
            List<QuizAttemptAnalyticsDTO> attempts = new java.util.ArrayList<>();
            try {
                attempts = attemptRepository.findByQuiz_QuizId(quizId)
                        .stream()
                        .filter(a -> a.getStudent() != null)
                        .map(a -> {
                            try {
                                UserAuthentication user = a.getStudent();
                                Student student = studentRepository.findByUser_Id(user.getId())
                                        .orElse(null);
                                
                                if (student == null) {
                                    return null;
                                }
                                
                                String name = user.getName() != null ? user.getName() : "Unknown";
                                String evalStatus = a.getStatus() != null ? a.getStatus().name() : "COMPLETED";
                                
                                // Calculate total score from all components
                                Integer autoScore = a.getAutoScore() != null ? a.getAutoScore() : 0;
                                Integer manualScore = a.getManualScore() != null ? a.getManualScore() : 0;
                                Integer aiScore = a.getAiScore() != null ? a.getAiScore() : 0;
                                Integer totalScore = autoScore + manualScore + aiScore;
                                
                                // Use the stored score if available, otherwise use calculated total
                                Integer finalScore = a.getScore() != null ? a.getScore() : totalScore;
                                
                                return new QuizAttemptAnalyticsDTO(
                                    a.getAttemptId(),
                                    student.getId(),
                                    name,
                                    finalScore,
                                    evalStatus,
                                    a.getSubmittedAt()
                                );
                            } catch (Exception e) {
                                System.err.println("Error processing attempt: " + e.getMessage());
                                return null;
                            }
                        })
                        .filter(dto -> dto != null)
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error loading attempts for quiz " + quizId + ": " + e.getMessage());
            }

            // ---------------- BUILD DTO ----------------
            QuizAnalyticsDTO dto = new QuizAnalyticsDTO();
            dto.setQuizId(quiz.getQuizId());
            dto.setTitle(quiz.getTitle() != null ? quiz.getTitle() : "Untitled Quiz");
            dto.setDifficulty(quiz.getDifficulty() != null ? quiz.getDifficulty() : "MEDIUM");
            dto.setTotalMarks(quiz.getTotalMarks() != null ? quiz.getTotalMarks() : 0);
            dto.setTopicId(quiz.getTopicId());
            dto.setQuestions(questionDTOs);
            dto.setAssignedStudents(assignedStudents);
            dto.setAttempts(attempts);
            dto.setTotalAssigned(assignedStudents.size());
            dto.setTotalAttempted(attempts.size());

            return dto;
        } catch (Exception e) {
            System.err.println("Error in getQuizAnalytics for quiz " + quizId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to load quiz analytics: " + e.getMessage());
        }
    }

    // =====================================================
    // QUIZ DETAILS (for Review / Edit)
    // =====================================================
    public QuizAnalyticsDTO getQuizDetails(Long quizId) {
        try {
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));

            List<QuizQuestionDTO> questions = new java.util.ArrayList<>();
            try {
                questions = questionRepository.findByQuiz_QuizId(quizId)
                        .stream()
                        .map(q -> {
                            QuizQuestionDTO dto = new QuizQuestionDTO();
                            dto.setQuestionId(q.getQuestionId());
                            dto.setQuestionText(q.getQuestion());
                            dto.setQuestionType(q.getType());
                            
                            List<String> options = new java.util.ArrayList<>();
                            if (q.getOptionA() != null) options.add(q.getOptionA());
                            if (q.getOptionB() != null) options.add(q.getOptionB());
                            if (q.getOptionC() != null) options.add(q.getOptionC());
                            if (q.getOptionD() != null) options.add(q.getOptionD());
                            dto.setOptions(options);
                            
                            dto.setCorrectAnswer(q.getCorrectAnswer());
                            return dto;
                        })
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error loading questions for quiz details " + quizId + ": " + e.getMessage());
            }

            QuizAnalyticsDTO dto = new QuizAnalyticsDTO();
            dto.setQuizId(quiz.getQuizId());
            dto.setTitle(quiz.getTitle() != null ? quiz.getTitle() : "Untitled Quiz");
            dto.setDifficulty(quiz.getDifficulty() != null ? quiz.getDifficulty() : "MEDIUM");
            dto.setTotalMarks(quiz.getTotalMarks() != null ? quiz.getTotalMarks() : 0);
            dto.setTopicId(quiz.getTopicId());
            dto.setQuestions(questions);

            return dto;
        } catch (Exception e) {
            System.err.println("Error in getQuizDetails for quiz " + quizId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to load quiz details: " + e.getMessage());
        }
    }
}
