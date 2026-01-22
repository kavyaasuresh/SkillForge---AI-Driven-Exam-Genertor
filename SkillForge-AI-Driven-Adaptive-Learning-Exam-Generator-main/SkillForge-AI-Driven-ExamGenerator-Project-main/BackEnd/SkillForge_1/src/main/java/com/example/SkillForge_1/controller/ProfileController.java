package com.example.SkillForge_1.controller;

import com.example.SkillForge_1.model.UserAuthentication;
import com.example.SkillForge_1.repository.UserAuthenticationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin("*")
public class ProfileController {

    @Autowired
    private UserAuthenticationRepository userRepository;

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData, Authentication auth) {
        try {
            String email = auth.getName();
            System.out.println("Updating profile for user: " + email);
            System.out.println("Profile data keys: " + profileData.keySet());
            
            UserAuthentication user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update profile fields
            if (profileData.containsKey("fullName") && profileData.get("fullName") != null) {
                user.setFullName(profileData.get("fullName"));
                System.out.println("Updated fullName: " + profileData.get("fullName"));
            }
            if (profileData.containsKey("profilePic") && profileData.get("profilePic") != null) {
                String profilePic = profileData.get("profilePic");
                user.setProfilePic(profilePic);
                System.out.println("Updated profilePic (length: " + profilePic.length() + ")");
            }
            if (profileData.containsKey("phone") && profileData.get("phone") != null) {
                user.setPhone(profileData.get("phone"));
            }
            if (profileData.containsKey("bio") && profileData.get("bio") != null) {
                user.setBio(profileData.get("bio"));
            }
            if (profileData.containsKey("department") && profileData.get("department") != null) {
                user.setDepartment(profileData.get("department"));
            }

            userRepository.save(user);
            System.out.println("Profile updated successfully");

            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "profilePic", user.getProfilePic() != null ? user.getProfilePic() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "bio", user.getBio() != null ? user.getBio() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : ""
            ));
        } catch (Exception e) {
            System.err.println("Profile update error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}