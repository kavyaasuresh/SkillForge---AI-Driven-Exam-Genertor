package com.example.SkillForge_1.model;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {

    @Id
    private Long id;   // 🔴 NO auto-generation

    // Link to UserAuthentication
    @OneToOne(fetch = FetchType.EAGER)
    @MapsId   // ⭐ MAGIC: user.id → student.id
    @JoinColumn(name = "user_id", nullable = false)
    private UserAuthentication user;


    public Student() {
    }

    public Student(UserAuthentication user) {
        this.user = user;
    }

    // ================= GETTERS & SETTERS =================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserAuthentication getUser() {
        return user;
    }

    public void setUser(UserAuthentication user) {
        this.user = user;
    }

    // ================= CONVENIENCE METHODS =================
    
    public String getName() {
        return user != null ? user.getName() : null;
    }
    
    public String getEmail() {
        return user != null ? user.getEmail() : null;
    }
    
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
}
