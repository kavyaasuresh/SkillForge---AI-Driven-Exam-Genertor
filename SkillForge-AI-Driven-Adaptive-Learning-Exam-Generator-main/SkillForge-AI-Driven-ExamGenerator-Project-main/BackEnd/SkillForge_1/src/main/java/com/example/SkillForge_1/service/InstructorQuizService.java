
package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.QuizCreateDTO;
import com.example.SkillForge_1.dto.QuizQuestionDTO;
import com.example.SkillForge_1.dto.StudentDTO;
import com.example.SkillForge_1.model.*;
import com.example.SkillForge_1.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InstructorQuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserAuthenticationRepository userAuthenticationRepository;

    @Autowired
    private QuizQuestionRepository questionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentQuizAssignmentRepository assignmentRepository;

    @Autowired
    private StudentQuestionResponseRepository responseRepo;

    @Autowired
    private StudentQuizAttemptRepository attemptRepository;

    // ================= CREATE QUIZ =================
    @Transactional
    public Quiz createQuiz(QuizCreateDTO dto) {

        if (dto.getQuestions() == null || dto.getQuestions().isEmpty()) {
            throw new IllegalArgumentException("Quiz must have at least one question");
        }

        if (dto.getAssignedStudentIds() == null || dto.getAssignedStudentIds().isEmpty()) {
            throw new IllegalArgumentException("Quiz must be assigned to students");
        }

        Quiz quiz = new Quiz();
        quiz.setTitle(dto.getTitle());
        quiz.setTopicId(dto.getTopicId());
        quiz.setDifficulty(dto.getDifficulty());
        quiz.setQuestionType(dto.getQuestionType());

        // Robust Total Marks Persistence
        int totalMarks = dto.getTotalMarks() > 0 ? dto.getTotalMarks() : 0;
        if (totalMarks == 0) {
            if ("LONG".equalsIgnoreCase(dto.getQuestionType())) {
                totalMarks = 100;
            } else {
                totalMarks = dto.getQuestions().size();
            }
        }
        quiz.setTotalMarks(totalMarks);
        quiz = quizRepository.save(quiz);

        // Create questions
        List<QuizQuestion> questions = new ArrayList<>();
        for (QuizQuestionDTO qdto : dto.getQuestions()) {

            QuizQuestion q = new QuizQuestion();
            q.setQuiz(quiz);
            q.setQuestion(qdto.getQuestionText());
            q.setType(qdto.getQuestionType());

            if ("MCQ".equalsIgnoreCase(qdto.getQuestionType())) {

                List<String> opts = qdto.getOptions();
                if (opts == null || opts.size() < 2) {
                    throw new IllegalArgumentException("MCQ must have options");
                }

                q.setOptionA(opts.size() > 0 ? opts.get(0) : null);
                q.setOptionB(opts.size() > 1 ? opts.get(1) : null);
                q.setOptionC(opts.size() > 2 ? opts.get(2) : null);
                q.setOptionD(opts.size() > 3 ? opts.get(3) : null);
                q.setCorrectAnswer(qdto.getCorrectAnswer());

            } else {
                q.setOptionA(null);
                q.setOptionB(null);
                q.setOptionC(null);
                q.setOptionD(null);
                q.setCorrectAnswer("");
            }

            questions.add(q);
        }

        questionRepository.saveAll(questions);
        quiz.setQuestions(questions);
        // Assign students
        List<Student> students = studentRepository.findAllById(dto.getAssignedStudentIds());
        List<StudentQuizAssignment> assignments = new ArrayList<>();
        for (Student s : students) {
            StudentQuizAssignment a = new StudentQuizAssignment();
            a.setQuiz(quiz);
            a.setStudent(s);
            assignments.add(a);
        }
        assignmentRepository.saveAll(assignments);
        quiz.setQuestions(questions);
        return quiz;
    }

    // ================= GET ALL STUDENTS =================
    public List<StudentDTO> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<StudentDTO> dtos = new ArrayList<>();
        for (Student s : students) {
            try {
                // Ensure user is loaded
                if (s.getUser() != null) {
                    dtos.add(new StudentDTO(
                            s.getId(),
                            s.getName() != null ? s.getName() : "Unknown Student",
                            s.getUserId()
                    ));
                } else {
                    System.out.println("Warning: Student with ID " + s.getId() + " has no associated user");
                }
            } catch (Exception e) {
                System.out.println("Error processing student ID " + s.getId() + ": " + e.getMessage());
            }
        }
        System.out.println("Returning " + dtos.size() + " students out of " + students.size() + " total");
        return dtos;
    }

    // ================= UPDATE QUIZ =================
    @Transactional
    public Quiz updateQuiz(Long quizId, QuizCreateDTO dto) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        quiz.setTitle(dto.getTitle());
        quiz.setDifficulty(dto.getDifficulty());
        quiz.setTopicId(dto.getTopicId());
        quiz.setQuestionType(dto.getQuestionType());

        // Robust Total Marks Persistence
        int totalMarks = dto.getTotalMarks() > 0 ? dto.getTotalMarks() : 0;
        if (totalMarks == 0) {
            if ("LONG".equalsIgnoreCase(dto.getQuestionType())) {
                totalMarks = 100;
            } else {
                totalMarks = dto.getQuestions().size();
            }
        }
        quiz.setTotalMarks(totalMarks);
        quizRepository.save(quiz);

        questionRepository.deleteByQuiz_QuizId(quizId);

        List<QuizQuestion> questions = new ArrayList<>();
        for (QuizQuestionDTO qdto : dto.getQuestions()) {

            QuizQuestion q = new QuizQuestion();
            q.setQuiz(quiz);
            q.setQuestion(qdto.getQuestionText());
            q.setType(qdto.getQuestionType());

            if ("MCQ".equalsIgnoreCase(qdto.getQuestionType())) {
                List<String> opts = qdto.getOptions();
                q.setOptionA(opts.size() > 0 ? opts.get(0) : null);
                q.setOptionB(opts.size() > 1 ? opts.get(1) : null);
                q.setOptionC(opts.size() > 2 ? opts.get(2) : null);
                q.setOptionD(opts.size() > 3 ? opts.get(3) : null);
                q.setCorrectAnswer(qdto.getCorrectAnswer());
            } else {
                q.setOptionA(null);
                q.setOptionB(null);
                q.setOptionC(null);
                q.setOptionD(null);
                q.setCorrectAnswer("");
            }

            questions.add(q);
        }

        questionRepository.saveAll(questions);
        return quiz;
    }

    // ================= DELETE QUIZ =================
    @Transactional
    public void deleteQuiz(Long quizId) {
        // Delete in correct order: responses -> attempts -> assignments -> questions -> quiz
        List<StudentQuizAttempt> attempts = attemptRepository.findByQuiz_QuizId(quizId);
        for (StudentQuizAttempt attempt : attempts) {
            responseRepo.deleteAll(responseRepo.findByAttempt_AttemptId(attempt.getAttemptId()));
        }
        attemptRepository.deleteAll(attempts);
        assignmentRepository.deleteByQuiz_QuizId(quizId);
        questionRepository.deleteByQuiz_QuizId(quizId);
        quizRepository.deleteById(quizId);
    }

    // ================= MANUAL EVALUATION =================
    @Transactional
    public void evaluateLongAnswer(Long responseId, Integer marks) {

        StudentQuestionResponse resp = responseRepo.findById(responseId)
                .orElseThrow();

        resp.setMarksObtained(marks);
        resp.setStatus(QuestionEvaluationStatus.MANUALLY_EVALUATED);
        responseRepo.save(resp);

        StudentQuizAttempt attempt = resp.getAttempt();

        attempt.setManualScore(
                (attempt.getManualScore() == null ? 0 : attempt.getManualScore()) + marks
        );

        attempt.setScore(
                attempt.getAutoScore()
                        + attempt.getManualScore()
                        + (attempt.getAiScore() == null ? 0 : attempt.getAiScore())
        );

        attempt.setStatus(AttemptStatus.COMPLETED);
        attemptRepository.save(attempt);
    }

    public Object getAttemptReview(Long attemptId) {
        try {
            StudentQuizAttempt attempt = attemptRepository.findById(attemptId)
                    .orElseThrow(() -> new RuntimeException("Attempt not found"));
            
            List<StudentQuestionResponse> responses = responseRepo.findByAttempt_AttemptId(attemptId);
            
            return new Object() {
                public final Long attemptId = attempt.getAttemptId();
                public final String studentName = attempt.getStudent().getName();
                public final String quizTitle = attempt.getQuiz().getTitle();
                public final List<Object> questions = responses.stream().map(r -> new Object() {
                    public final Long responseId = r.getResponseId();
                    public final String questionText = r.getQuestion().getQuestion();
                    public final String type = r.getQuestion().getType();
                    public final String studentAnswer = r.getStudentAnswer();
                    public final Integer marksObtained = r.getMarksObtained();
                    public final Integer maxMarks = 1;
                }).collect(java.util.stream.Collectors.toList());
            };
        } catch (Exception e) {
            throw new RuntimeException("Failed to load attempt review: " + e.getMessage());
        }
    }

    public List<Object> getPendingReviews() {
        try {
            List<StudentQuizAttempt> pendingAttempts = attemptRepository.findByStatus(AttemptStatus.PENDING_MANUAL_EVALUATION);
            
            return pendingAttempts.stream().map(attempt -> new Object() {
                public final Long attemptId = attempt.getAttemptId();
                public final String studentName = attempt.getStudent().getName();
                public final String quizTitle = attempt.getQuiz().getTitle();
                public final Integer autoScore = attempt.getAutoScore();
                public final Integer totalMarks = attempt.getQuiz().getTotalMarks();
            }).collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to load pending reviews: " + e.getMessage());
        }
    }
}
