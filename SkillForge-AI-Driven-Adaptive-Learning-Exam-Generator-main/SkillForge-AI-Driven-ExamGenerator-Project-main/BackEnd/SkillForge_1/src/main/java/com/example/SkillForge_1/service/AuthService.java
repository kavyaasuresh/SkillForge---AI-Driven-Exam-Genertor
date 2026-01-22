package com.example.SkillForge_1.service;

import com.example.SkillForge_1.dto.LoginResponse;
import com.example.SkillForge_1.dto.RegisterRequest;
import com.example.SkillForge_1.dto.RegisterResponse;
import com.example.SkillForge_1.model.Student;
import com.example.SkillForge_1.model.UserAuthentication;
import com.example.SkillForge_1.repository.StudentRepository;
import com.example.SkillForge_1.repository.UserAuthenticationRepository;
import com.example.SkillForge_1.security.JwtService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserAuthenticationRepository userAuthRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ✅ SINGLE CONSTRUCTOR (IMPORTANT)
    public AuthService(UserAuthenticationRepository userAuthRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userAuthRepository = userAuthRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ================= REGISTER =================
    @Transactional
    public RegisterResponse register(RegisterRequest request) {

        // 1️⃣ Save user
        UserAuthentication user = new UserAuthentication();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userAuthRepository.save(user); // ID GENERATED HERE

        // 2️⃣ AUTO INSERT INTO STUDENT TABLE (KEY FIX)
        if ("STUDENT".equalsIgnoreCase(user.getRole())) {
            Student student = new Student();
            student.setUser(user);   // ⭐ REQUIRED FOR @MapsId
            studentRepository.save(student);
        }

        // 3️⃣ Generate JWT
        UserDetails userDetails = User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole())
                .build();

        String token = jwtService.generateToken(userDetails);

        // 4️⃣ Return response
        return new RegisterResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    // ================= LOGIN =================
    public LoginResponse login(String email, String password) {

        UserAuthentication user = userAuthRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        UserDetails userDetails = User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole())
                .build();

        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getRole(),
                user.getId(),
                user.getName(),
                user.getFullName() != null ? user.getFullName() : user.getName(),
                user.getProfilePic() != null ? user.getProfilePic() : "",
                user.getPhone() != null ? user.getPhone() : "",
                user.getBio() != null ? user.getBio() : "",
                user.getDepartment() != null ? user.getDepartment() : ""
        );
    }
}
