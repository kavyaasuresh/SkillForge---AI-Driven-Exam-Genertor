////package com.example.SkillForge_1.controller;
////
////import com.example.SkillForge_1.dto.QuizCreateDTO;
////import com.example.SkillForge_1.model.Quiz;
////import com.example.SkillForge_1.model.Student;
////import com.example.SkillForge_1.service.InstructorQuizService;
////import org.springframework.beans.factory.annotation.Autowired;
////import org.springframework.http.ResponseEntity;
////import org.springframework.web.bind.annotation.*;
////
////import java.util.List;
////
////@RestController
////@RequestMapping("/api/instructor")
////public class InstructorQuizController {
////
////    @Autowired
////    private InstructorQuizService quizService;
////
////    @GetMapping("/students")
////    public ResponseEntity<List<Student>> getRegisteredStudents() {
////        return ResponseEntity.ok(quizService.getAllStudents());
////    }
////
////    @PostMapping("/quiz/create")
////    public ResponseEntity<?> createQuiz(@RequestBody QuizCreateDTO dto) {
////        Quiz created = quizService.createQuiz(dto);
////        return ResponseEntity.ok(created);
////    }
////}
//package com.example.SkillForge_1.controller;
//
//import com.example.SkillForge_1.dto.QuizCreateDTO;
//import com.example.SkillForge_1.dto.StudentDTO;
//import com.example.SkillForge_1.model.Quiz;
//import com.example.SkillForge_1.service.InstructorQuizService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/instructor")
//public class InstructorQuizController {
//
//    @Autowired
//    private InstructorQuizService quizService;
//
//    // Fetch students for assign dropdown
//    @GetMapping("/students")
//    public ResponseEntity<List<StudentDTO>> getRegisteredStudents() {
//        return ResponseEntity.ok(quizService.getAllStudents());
//    }
//
//
//    // Create quiz
//    @PostMapping("/quiz/create")
//    public ResponseEntity<?> createQuiz(@RequestBody QuizCreateDTO dto) {
//        Quiz created = quizService.createQuiz(dto);
//        return ResponseEntity.ok(created);
//    }
//    @PostMapping("/quiz/ai-create")
//    public ResponseEntity<?> createQuizFromAI(@RequestBody QuizCreateDTO dto) {
//
//        // This REUSES your existing quiz creation logic
//        Quiz created = quizService.createQuiz(dto);
//
//        return ResponseEntity.ok(created);
//    }
//
//}
package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.QuizCreateDTO;
import com.example.SkillForge_1.dto.QuizListDTO;
import com.example.SkillForge_1.dto.QuizQuestionDTO;
import com.example.SkillForge_1.dto.StudentDTO;
import com.example.SkillForge_1.model.Quiz;
import com.example.SkillForge_1.model.Student;
import com.example.SkillForge_1.repository.StudentQuizAssignmentRepository;
import com.example.SkillForge_1.repository.StudentRepository;
import com.example.SkillForge_1.service.InstructorQuizService;
import com.example.SkillForge_1.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructor")
public class InstructorQuizController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private InstructorQuizService quizService;

    @Autowired
    private StudentQuizAssignmentRepository assignmentRepository;

    @Autowired
    private QuizRepository quizRepository; // ✅ inject repository for /quiz/all

    // Fetch students for assign dropdown
    @GetMapping("/students")
    public ResponseEntity<List<StudentDTO>> getRegisteredStudents() {
        try {
            List<StudentDTO> students = quizService.getAllStudents();
            System.out.println("Controller: Returning " + students.size() + " students");
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            System.err.println("Error fetching students: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    
    // Debug endpoint to check student data
    @GetMapping("/students/debug")
    public ResponseEntity<?> debugStudents() {
        try {
            List<Student> rawStudents = studentRepository.findAll();
            System.out.println("Raw students count: " + rawStudents.size());
            
            List<Object> debugInfo = new ArrayList<>();
            for (Student s : rawStudents) {
                Map<String, Object> info = new HashMap<>();
                info.put("studentId", s.getId());
                info.put("hasUser", s.getUser() != null);
                if (s.getUser() != null) {
                    info.put("userName", s.getUser().getName());
                    info.put("userEmail", s.getUser().getEmail());
                    info.put("userRole", s.getUser().getRole());
                }
                debugInfo.add(info);
            }
            
            return ResponseEntity.ok(Map.of(
                "totalStudents", rawStudents.size(),
                "students", debugInfo
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    // Create quiz
    @PostMapping("/quiz/create")
    public ResponseEntity<?> createQuiz(@RequestBody QuizCreateDTO dto) {
        Quiz created = quizService.createQuiz(dto);
        return ResponseEntity.ok(created);
    }
//    @PostMapping("/quiz/ai-create")
//    public ResponseEntity<?> createQuizFromAI(@RequestBody QuizCreateDTO dto) {
//        System.out.println("AI QUIZ DTO = " + dto);
//        Quiz created = quizService.createQuiz(dto);
//        return ResponseEntity.ok(created);
//    }
@PostMapping("/quiz/ai-create")
public ResponseEntity<?> createQuizFromAI(@RequestBody QuizCreateDTO dto) {
    System.out.println("AI QUIZ DTO = " + dto);
    Quiz created = quizService.createQuiz(dto);
    return ResponseEntity.ok(created);
}


    // ✅ NEW: Get all quizzes
    @GetMapping("/quiz/all")
    public ResponseEntity<List<QuizListDTO>> getAllQuizzes() {

        List<QuizListDTO> quizzes = quizRepository.findAll()
                .stream()
                .map(q -> new QuizListDTO(
                        q.getQuizId(),
                        q.getTitle(),
                        q.getDifficulty(),
                        q.getTotalMarks(),
                        q.getTopicId(),
                        q.isActive()
                ))
                .toList();

        return ResponseEntity.ok(quizzes);
    }
    @PutMapping("/quiz/{id}")
    public ResponseEntity<Void> updateQuiz(
            @PathVariable Long id,
            @RequestBody QuizCreateDTO dto) {

        quizService.updateQuiz(id, dto);
        return ResponseEntity.ok().build(); // ✅ NO ENTITY RETURNED
    }
    @DeleteMapping("/quiz/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build(); // 204
    }

    @GetMapping("/quiz/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return ResponseEntity.ok(quiz);
    }
//    @GetMapping("/analytics/review/{attemptId}")
//    public ResponseEntity<?> getAttemptReview(@PathVariable Long attemptId) {
//        try {
//            return ResponseEntity.ok(quizService.getAttemptReview(attemptId));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Failed to load attempt review: " + e.getMessage());
//        }
//    }
//
//    @GetMapping("/analytics/pending-reviews")
//    public ResponseEntity<?> getPendingReviews() {
//        try {
//            return ResponseEntity.ok(quizService.getPendingReviews());
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Failed to load pending reviews: " + e.getMessage());
//        }
//    }

}
