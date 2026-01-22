package com.example.SkillForge_1.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class UserAuthentication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;
    private String role;
    
    // Additional profile fields
    private String fullName;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePic;
    
    private String phone;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    private String department;

    public UserAuthentication() {}

    public UserAuthentication(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.fullName = name; // Default fullName to name
    }

    // Getters & Setters
    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { 
        this.name = name;
        if (this.fullName == null || this.fullName.isEmpty()) {
            this.fullName = name;
        }
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getFullName() { return fullName != null ? fullName : name; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
