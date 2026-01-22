package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.QuizQuestionDTO;
import com.example.SkillForge_1.dto.QuizSubmitDTO;
import com.example.SkillForge_1.dto.StudentQuizDTO;
import com.example.SkillForge_1.model.StudentQuizAttempt;
import com.example.SkillForge_1.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
public class StudentQuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping("/quizzes")
    public List<StudentQuizDTO> quizzes(Authentication auth) {
        return quizService.getStudentQuizzes(auth.getName());
    }

    @GetMapping("/quiz/{quizId}/questions")
    public List<QuizQuestionDTO> questions(@PathVariable Long quizId) {
        return quizService.getQuestions(quizId);
    }

//    @PostMapping("/quiz/{quizId}/submit")
//    public void submitQuiz(
//            @PathVariable Long quizId,
//            @RequestBody QuizSubmitDTO dto,
//            Authentication auth
//    ) {
//        String studentEmail = auth.getName();
//        quizService.submitQuiz(studentEmail, quizId, dto.getAnswers());
//    }
@PostMapping("/quiz/{quizId}/submit")
public ResponseEntity<?> submitQuiz(
        @PathVariable Long quizId,
        @RequestBody Map<String, String> answers
) {
    String email = SecurityContextHolder.getContext().getAuthentication().getName();

    Map<Long, String> longKeyAnswers = answers.entrySet().stream()
            .collect(Collectors.toMap(
                    e -> Long.parseLong(e.getKey()),
                    Map.Entry::getValue
            ));

    StudentQuizAttempt attempt = quizService.submitQuiz(quizId, email, longKeyAnswers);

    int tm = quizService.calculateTotalMarks(attempt.getQuiz());
    int percentage = (tm == 0) ? 0 : (attempt.getScore() * 100) / tm;

    // Return SAFE DTO (not entity)
    Map<String, Object> response = new HashMap<>();
    response.put("attemptId", attempt.getAttemptId());
    response.put("score", attempt.getScore());
    response.put("totalMarks", tm);
    response.put("percentage", percentage);
    response.put("submittedAt", attempt.getSubmittedAt());

    return ResponseEntity.ok(response);
}

@PostMapping("/quiz/{quizId}/retake")
public ResponseEntity<?> retakeQuiz(@PathVariable Long quizId) {
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    quizService.retakeQuiz(quizId, email);
    return ResponseEntity.ok().build();
}

@GetMapping("/quiz/{quizId}")
public ResponseEntity<StudentQuizDTO> getQuiz(@PathVariable Long quizId) {
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    return ResponseEntity.ok(quizService.getStudentQuiz(quizId, email));
}

}
