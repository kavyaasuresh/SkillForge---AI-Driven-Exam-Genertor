//package com.example.SkillForge_1.controller;
//import com.example.SkillForge_1.dto.LoginRequest;
//import com.example.SkillForge_1.dto.RegisterRequest;
//import com.example.SkillForge_1.dto.RegisterResponse;
//import com.example.SkillForge_1.service.AuthService;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:5173")
//public class AuthController {
//
//    private final AuthService authService;
//
//    public AuthController(AuthService authService) {
//        this.authService = authService;
//    }
//
//    @PostMapping("/register")
//    public RegisterResponse register(@RequestBody RegisterRequest request) {
//        return authService.register(request); // now return type matches
//    }
//    @PostMapping("/login")
//    public RegisterResponse login(@RequestBody LoginRequest request) throws Exception {
//        return authService.login(request.getEmail(), request.getPassword());
//    }
//
//
//}
package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.dto.LoginRequest;
import com.example.SkillForge_1.dto.LoginResponse;
import com.example.SkillForge_1.dto.RegisterRequest;
import com.example.SkillForge_1.dto.RegisterResponse;
import com.example.SkillForge_1.model.Student;
import com.example.SkillForge_1.model.UserAuthentication;
import com.example.SkillForge_1.repository.StudentRepository;
import com.example.SkillForge_1.repository.UserAuthenticationRepository;
import com.example.SkillForge_1.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // ✅ LOGIN (FIXED)
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }
}
