//package com.example.SkillForge_1.service;
//import com.example.SkillForge_1.dto.QuestionResultDTO;
//import com.example.SkillForge_1.dto.QuizResultDTO;
//import com.example.SkillForge_1.dto.QuizResultSummaryDTO;
//import com.example.SkillForge_1.model.StudentQuestionResponse;
//import com.example.SkillForge_1.model.StudentQuizAttempt;
//import com.example.SkillForge_1.repository.StudentQuestionResponseRepository;
//import com.example.SkillForge_1.repository.StudentQuizAttemptRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class QuizResultService {
//
//    @Autowired
//    private StudentQuizAttemptRepository attemptRepository;
//
//    @Autowired
//    private StudentQuestionResponseRepository responseRepository;
//
//    // ------------------ QUICK RESULT ------------------
//    public QuizResultDTO getQuickResultByQuizAndStudent(Long quizId, String email) {
//        StudentQuizAttempt attempt = attemptRepository
//                .findByQuiz_QuizIdAndStudent_Email(quizId, email)
//                .orElseThrow(() -> new RuntimeException("Attempt not found for this student"));
//
//        List<StudentQuestionResponse> responses = responseRepository
//                .findByAttempt_AttemptId(attempt.getAttemptId());
//        String quizType = attempt.getQuiz().getQuestionType(); // MCQ or LONG
//        boolean isSubjectiveQuiz = "LONG".equalsIgnoreCase(quizType);
//
//        int totalQuestions = responses.size();
//        int correctCount = (int) responses.stream()
//                .filter(r -> r.getMarksAwarded() != null && r.getMarksAwarded() > 0)
//                .count();
//        int attendedCount = (int) responses.stream()
//                .filter(r -> r.getStudentAnswer() != null)
//                .count();
//        int totalScore = responses.stream()
//                .mapToInt(r -> r.getMarksAwarded() != null ? r.getMarksAwarded() : 0)
//                .sum();
//        int totalMarks;
//
//        if (isSubjectiveQuiz) {
//            totalMarks = 100;
//        } else {
//            totalMarks = responses.stream()
//                    .mapToInt(r -> r.getQuestion() != null && r.getQuestion().getMarks() != null
//                            ? r.getQuestion().getMarks() : 0)
//                    .sum();
//        }
//
//        int percentage;
//        String passStatus;
//
//        if (isSubjectiveQuiz) {
//            percentage = totalScore;
//            passStatus = totalScore > 0 ? "Pass" : "Fail";
//        } else {
//            percentage = totalMarks == 0 ? 0 : (totalScore * 100) / totalMarks;
//            passStatus = percentage >= 50 ? "Pass" : "Fail";
//        }
//
//        String suggestion = ""; // optional AI suggestion logic
//
//        QuizResultDTO dto = new QuizResultDTO();
//        dto.setAttemptId(attempt.getAttemptId());
//        dto.setQuizTitle(attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : "Quiz");
//        dto.setTopicTitle(attempt.getQuiz() != null && attempt.getQuiz().getTopic() != null
//                ? attempt.getQuiz().getTopic() : "Topic");
//        dto.setTotalScore(totalScore);
//        dto.setTotalMarks(totalMarks);
//        dto.setCorrectCount(correctCount);
//        dto.setTotalQuestions(totalQuestions);
//        dto.setAttendedCount(attendedCount);
//        dto.setPercentage(percentage);
//        dto.setPassStatus(passStatus);
//        dto.setSuggestion(suggestion);
//
//        return dto;
//    }
//
//    // ------------------ FULL SUMMARY ------------------
//    public QuizResultSummaryDTO getFullSummaryByQuizAndStudent(Long quizId, String email) {
//        StudentQuizAttempt attempt = attemptRepository
//                .findByQuiz_QuizIdAndStudent_Email(quizId, email)
//                .orElseThrow(() -> new RuntimeException("Attempt not found"));
//
//        List<StudentQuestionResponse> responses = responseRepository
//                .findByAttempt_AttemptId(attempt.getAttemptId());
//        String quizType = attempt.getQuiz().getQuestionType(); // MCQ or LONG
//        boolean isSubjectiveQuiz = "LONG".equalsIgnoreCase(quizType);
//
//        List<QuestionResultDTO> questionResults = responses.stream().map(r -> {
//            QuestionResultDTO dto = new QuestionResultDTO();
//            dto.setQuestion(r.getQuestion() != null ? r.getQuestion().getQuestion() : "Question not available");
//            dto.setStudentAnswer(r.getStudentAnswer() != null ? r.getStudentAnswer() : "Not answered");
//            dto.setCorrectAnswer(r.getQuestion() != null && r.getQuestion().getCorrectAnswer() != null
//                    ? r.getQuestion().getCorrectAnswer() : "Correct answer not available");
//            dto.setMarksAwarded(r.getMarksAwarded() != null ? r.getMarksAwarded() : 0);
//            dto.setEvaluationStatus(r.getEvaluationStatus() != null ? r.getEvaluationStatus().toString() : "PENDING");
//            return dto;
//        }).collect(Collectors.toList());
//
//        int totalScore = questionResults.stream().mapToInt(QuestionResultDTO::getMarksAwarded).sum();
//        int totalMarks;
//
//        if (isSubjectiveQuiz) {
//            totalMarks = 100;
//        } else {
//            totalMarks = responses.stream()
//                    .mapToInt(r -> r.getQuestion() != null && r.getQuestion().getMarks() != null
//                            ? r.getQuestion().getMarks() : 0)
//                    .sum();
//        }
//
//        int percentage;
//        String passStatus;
//
//        if (isSubjectiveQuiz) {
//            percentage = totalScore;
//            passStatus = totalScore > 0 ? "Pass" : "Fail";
//        } else {
//            percentage = totalMarks == 0 ? 0 : (totalScore * 100) / totalMarks;
//            passStatus = percentage >= 50 ? "Pass" : "Fail";
//        }
//
//        QuizResultSummaryDTO summary = new QuizResultSummaryDTO();
//        summary.setAttemptId(attempt.getAttemptId());
//        summary.setQuizTitle(attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : "Quiz");
//        summary.setTopicTitle(attempt.getQuiz() != null && attempt.getQuiz().getTopic() != null
//                ? attempt.getQuiz().getTopic() : "Topic");
//        summary.setStudentName(attempt.getStudent() != null ? attempt.getStudent().getName() : "Student");
//        summary.setStudentId(email);
//        summary.setAttemptDate(attempt.getSubmittedAt() != null ? attempt.getSubmittedAt().toString() : "N/A");
//        summary.setTotalScore(totalScore);
//        summary.setTotalMarks(totalMarks);
//        summary.setPercentage(percentage);
//        summary.setPassStatus(passStatus);
//        summary.setQuestions(questionResults);
//
//        return summary;
//    }
//}
//package com.example.SkillForge_1.service;
//
//import com.example.SkillForge_1.dto.QuestionResultDTO;
//import com.example.SkillForge_1.dto.QuizResultDTO;
//import com.example.SkillForge_1.dto.QuizResultSummaryDTO;
//import com.example.SkillForge_1.model.StudentQuestionResponse;
//import com.example.SkillForge_1.model.StudentQuizAttempt;
//import com.example.SkillForge_1.repository.StudentQuestionResponseRepository;
//import com.example.SkillForge_1.repository.StudentQuizAttemptRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class QuizResultService {
//
//    @Autowired
//    private StudentQuizAttemptRepository attemptRepository;
//
//    @Autowired
//    private StudentQuestionResponseRepository responseRepository;
//
//    // ================= QUICK RESULT =================
//    public QuizResultDTO getQuickResultByQuizAndStudent(Long quizId, String email) {
//
//        StudentQuizAttempt attempt = attemptRepository
//                .findByQuiz_QuizIdAndStudent_Email(quizId, email)
//                .orElseThrow(() -> new RuntimeException("Attempt not found"));
//
//        List<StudentQuestionResponse> responses =
//                responseRepository.findByAttempt_AttemptId(attempt.getAttemptId());
//
//        String quizType = attempt.getQuiz().getQuestionType(); // MCQ / LONG
//        boolean isSubjective = "LONG".equalsIgnoreCase(quizType);
//
//        int totalQuestions = responses.size();
//
//        int attendedCount = (int) responses.stream()
//                .filter(r -> r.getStudentAnswer() != null && !r.getStudentAnswer().isBlank())
//                .count();
//
//        int correctCount = (int) responses.stream()
//                .filter(r -> r.getMarksAwarded() != null && r.getMarksAwarded() > 0)
//                .count();
//
//        int totalScore = responses.stream()
//                .mapToInt(r -> r.getMarksAwarded() != null ? r.getMarksAwarded() : 0)
//                .sum();
//
//        int totalMarks = isSubjective
//                ? 100
//                : responses.stream()
//                .mapToInt(r -> r.getQuestion() != null && r.getQuestion().getMarks() != null
//                        ? r.getQuestion().getMarks()
//                        : 0)
//                .sum();
//
//        int percentage = totalMarks == 0 ? 0 : (totalScore * 100) / totalMarks;
//        String passStatus = percentage >= 50 ? "Pass" : "Fail";
//
//        QuizResultDTO dto = new QuizResultDTO();
//        dto.setAttemptId(attempt.getAttemptId());
//        dto.setQuizTitle(attempt.getQuiz().getTitle());
//
//        // ✅ FIXED TOPIC
//        dto.setTopicTitle(
//                attempt.getQuiz().getTopic() != null
//                        ? attempt.getQuiz().getTopic()
//                        : "N/A"
//        );
//
//
//        dto.setTotalScore(totalScore);
//        dto.setTotalMarks(totalMarks);
//        dto.setCorrectCount(correctCount);
//        dto.setTotalQuestions(totalQuestions);
//        dto.setAttendedCount(attendedCount);
//        dto.setPercentage(percentage);
//        dto.setPassStatus(passStatus);
//        dto.setSuggestion("");
//
//        return dto;
//    }
//
//    // ================= FULL SUMMARY =================
//    public QuizResultSummaryDTO getFullSummaryByQuizAndStudent(Long quizId, String email) {
//
//        StudentQuizAttempt attempt = attemptRepository
//                .findByQuiz_QuizIdAndStudent_Email(quizId, email)
//                .orElseThrow(() -> new RuntimeException("Attempt not found"));
//
//        List<StudentQuestionResponse> responses =
//                responseRepository.findByAttempt_AttemptId(attempt.getAttemptId());
//
//        String quizType = attempt.getQuiz().getQuestionType();
//        boolean isSubjective = "LONG".equalsIgnoreCase(quizType);
//
//        List<QuestionResultDTO> questionResults = responses.stream().map(r -> {
//            QuestionResultDTO q = new QuestionResultDTO();
//
//            q.setQuestion(
//                    r.getQuestion() != null ? r.getQuestion().getQuestion() : "Question unavailable"
//            );
//
//            q.setStudentAnswer(
//                    r.getStudentAnswer() != null && !r.getStudentAnswer().isBlank()
//                            ? r.getStudentAnswer()
//                            : "Not answered"
//            );
//
//            // ✅ FIX: do NOT send empty correct answer for LONG
//            if (isSubjective) {
//                q.setCorrectAnswer(null);
//            } else {
//                q.setCorrectAnswer(
//                        r.getQuestion() != null ? r.getQuestion().getCorrectAnswer() : null
//                );
//            }
//
//            q.setMarksAwarded(r.getMarksAwarded() != null ? r.getMarksAwarded() : 0);
//            q.setEvaluationStatus(
//                    r.getEvaluationStatus() != null
//                            ? r.getEvaluationStatus().toString()
//                            : "PENDING"
//            );
//
//            return q;
//        }).collect(Collectors.toList());
//
//        int totalScore = questionResults.stream()
//                .mapToInt(QuestionResultDTO::getMarksAwarded)
//                .sum();
//
//        int totalMarks = isSubjective
//                ? 100
//                : responses.stream()
//                .mapToInt(r -> r.getQuestion() != null && r.getQuestion().getMarks() != null
//                        ? r.getQuestion().getMarks()
//                        : 0)
//                .sum();
//
//        int percentage = totalMarks == 0 ? 0 : (totalScore * 100) / totalMarks;
//        String passStatus = percentage >= 50 ? "Pass" : "Fail";
//
//        QuizResultSummaryDTO summary = new QuizResultSummaryDTO();
//        summary.setAttemptId(attempt.getAttemptId());
//        summary.setQuizTitle(attempt.getQuiz().getTitle());
//
//        // ✅ FIXED TOPIC
//        summary.setTopicTitle(
//                attempt.getQuiz().getTopic() != null
//                        ? attempt.getQuiz().getTopic()
//                        : "N/A"
//        );
//
//
//        summary.setStudentName(attempt.getStudent().getName());
//        summary.setStudentId(email);
//        summary.setAttemptDate(attempt.getSubmittedAt().toString());
//        summary.setTotalScore(totalScore);
//        summary.setTotalMarks(totalMarks);
//        summary.setPercentage(percentage);
//        summary.setPassStatus(passStatus);
//        summary.setQuestions(questionResults);
//
//        return summary;
//    }
//}

package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.QuestionResultDTO;
import com.example.SkillForge_1.dto.QuizResultDTO;
import com.example.SkillForge_1.dto.QuizResultSummaryDTO;
import com.example.SkillForge_1.model.StudentQuestionResponse;
import com.example.SkillForge_1.model.StudentQuizAttempt;
import com.example.SkillForge_1.repository.StudentQuestionResponseRepository;
import com.example.SkillForge_1.repository.StudentQuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizResultService {

    @Autowired
    private StudentQuizAttemptRepository attemptRepository;

    @Autowired
    private StudentQuestionResponseRepository responseRepository;

    // ------------------ QUICK RESULT ------------------
    public QuizResultDTO getQuickResultByQuizAndStudent(Long quizId, String email) {
        StudentQuizAttempt attempt = attemptRepository
                .findByQuiz_QuizIdAndStudent_Email(quizId, email)
                .orElseThrow(() -> new RuntimeException("Attempt not found for this student"));

        List<StudentQuestionResponse> responses = responseRepository
                .findByAttempt_AttemptId(attempt.getAttemptId());

        String quizType = attempt.getQuiz().getQuestionType(); // MCQ or LONG
        boolean isSubjectiveQuiz = "LONG".equalsIgnoreCase(quizType) || 
            responses.stream().anyMatch(r -> r.getQuestion() != null && "LONG".equalsIgnoreCase(r.getQuestion().getType()));

        int totalQuestions = responses.size();
        int correctCount = (int) responses.stream()
                .filter(r -> {
                    Integer awarded = r.getMarksAwarded();
                    Integer obtained = r.getMarksObtained();
                    int marks = (awarded != null && awarded > 0) ? awarded : (obtained != null ? obtained : 0);
                    // Cap to 1 for MCQ
                    if (!isSubjectiveQuiz && marks > 1) marks = 1;
                    return marks > 0;
                })
                .count();
        int attendedCount = (int) responses.stream()
                .filter(r -> r.getStudentAnswer() != null)
                .count();
        int totalScore = responses.stream()
                .mapToInt(r -> {
                    Integer awarded = r.getMarksAwarded();
                    Integer obtained = r.getMarksObtained();
                    int marks = 0;
                    if (awarded != null && awarded > 0) marks = awarded;
                    else if (obtained != null) marks = obtained;
                    // Cap each question's marks to 1 for MCQ (fix for old buggy data)
                    if (!isSubjectiveQuiz && marks > 1) marks = 1;
                    return marks;
                })
                .sum();

        // ---- Total Marks ----
        int totalMarks;
        if (isSubjectiveQuiz) {
            totalMarks = (attempt.getQuiz().getTotalMarks() != null && attempt.getQuiz().getTotalMarks() > 0) 
                         ? attempt.getQuiz().getTotalMarks() : 100; // standard rubric fallback
        } else {
            // For MCQ: totalMarks = number of questions (each worth 1 mark)
            totalMarks = totalQuestions;
        }

        // ---- Percentage and Pass/Fail ----
        int percentage = totalMarks == 0 ? 0 : (totalScore * 100) / totalMarks;
        String passStatus = percentage >= 50 ? "Pass" : "Fail";

        QuizResultDTO dto = new QuizResultDTO();
        dto.setAttemptId(attempt.getAttemptId());
        dto.setQuizTitle(attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : "Quiz");
        dto.setTopicTitle(attempt.getQuiz() != null && attempt.getQuiz().getTopic() != null
                ? attempt.getQuiz().getTopic()  // just use the String
                : "N/A");// fixed topic
        dto.setTotalScore(totalScore);
        dto.setTotalMarks(totalMarks);
        dto.setCorrectCount(correctCount);
        dto.setTotalQuestions(totalQuestions);
        dto.setAttendedCount(attendedCount);
        dto.setPercentage(percentage);
        dto.setPassStatus(passStatus);
        dto.setSuggestion(""); // optional AI suggestion

        return dto;
    }

    // ------------------ FULL SUMMARY ------------------
    public QuizResultSummaryDTO getFullSummaryByQuizAndStudent(Long quizId, String email) {
        StudentQuizAttempt attempt = attemptRepository
                .findByQuiz_QuizIdAndStudent_Email(quizId, email)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        List<StudentQuestionResponse> responses = responseRepository
                .findByAttempt_AttemptId(attempt.getAttemptId());

        String quizType = attempt.getQuiz().getQuestionType(); // MCQ or LONG
        boolean isSubjectiveQuiz = "LONG".equalsIgnoreCase(quizType) || 
            responses.stream().anyMatch(r -> r.getQuestion() != null && "LONG".equalsIgnoreCase(r.getQuestion().getType()));

        // Calculate totalScore from responses (same as Quick Result)
        int totalScore = responses.stream()
                .mapToInt(r -> {
                    // Use marksAwarded if available, otherwise fallback to marksObtained
                    Integer awarded = r.getMarksAwarded();
                    Integer obtained = r.getMarksObtained();
                    int marks = 0;
                    if (awarded != null && awarded > 0) marks = awarded;
                    else if (obtained != null) marks = obtained;
                    // Cap each question's marks to 1 for MCQ (fix for old buggy data)
                    if (!isSubjectiveQuiz && marks > 1) marks = 1;
                    return marks;
                })
                .sum();

        List<QuestionResultDTO> questionResults = responses.stream().map(r -> {
            QuestionResultDTO dto = new QuestionResultDTO();
            dto.setQuestion(r.getQuestion() != null ? r.getQuestion().getQuestion() : "Question not available");
            dto.setStudentAnswer(r.getStudentAnswer() != null ? r.getStudentAnswer() : "Not answered");
            dto.setCorrectAnswer(r.getQuestion() != null && r.getQuestion().getCorrectAnswer() != null
                    ? r.getQuestion().getCorrectAnswer() : "Correct answer not available");
            // Use marksAwarded if available, otherwise fallback to marksObtained
            Integer marks = r.getMarksAwarded() != null && r.getMarksAwarded() > 0 
                    ? r.getMarksAwarded() 
                    : (r.getMarksObtained() != null ? r.getMarksObtained() : 0);
            // Cap each question's marks to 1 for MCQ (fix for old buggy data)
            if (!isSubjectiveQuiz && marks > 1) {
                marks = 1;
            }
            dto.setMarksAwarded(marks);
            dto.setEvaluationStatus(r.getEvaluationStatus() != null ? r.getEvaluationStatus().toString() : "PENDING");
            dto.setQuestionId(r.getQuestion() != null ? r.getQuestion().getQuestionId() : null);
            dto.setMaxMarks(r.getQuestion() != null && r.getQuestion().getMarks() != null
                    ? r.getQuestion().getMarks() : 1);
            dto.setType(r.getQuestion() != null && r.getQuestion().getType() != null
                    ? r.getQuestion().getType() : "UNKNOWN");
            return dto;
        }).collect(Collectors.toList());

        int totalMarks;
        if (isSubjectiveQuiz) {
            totalMarks = (attempt.getQuiz().getTotalMarks() != null && attempt.getQuiz().getTotalMarks() > 0) 
                         ? attempt.getQuiz().getTotalMarks() : 100;
        } else {
            // For MCQ: totalMarks = number of questions (each worth 1 mark)
            totalMarks = responses.size();
        }

        int percentage = totalMarks == 0 ? 0 : (totalScore * 100) / totalMarks;
        String passStatus = percentage >= 50 ? "Pass" : "Fail";

        QuizResultSummaryDTO summary = new QuizResultSummaryDTO();
        summary.setAttemptId(attempt.getAttemptId());
        summary.setQuizTitle(attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : "Quiz");
        summary.setTopicTitle(attempt.getQuiz() != null && attempt.getQuiz().getTopic() != null
                ? attempt.getQuiz().getTopic()
                : "N/A");
        summary.setStudentName(attempt.getStudent() != null ? attempt.getStudent().getName() : "Student");
        summary.setStudentId(email);
        summary.setAttemptDate(attempt.getSubmittedAt() != null ? attempt.getSubmittedAt().toString() : "N/A");
        summary.setTotalScore(totalScore);
        summary.setTotalMarks(totalMarks);
        summary.setPercentage(percentage);
        summary.setPassStatus(passStatus);
        summary.setQuestions(questionResults);

        return summary;
    }
}

