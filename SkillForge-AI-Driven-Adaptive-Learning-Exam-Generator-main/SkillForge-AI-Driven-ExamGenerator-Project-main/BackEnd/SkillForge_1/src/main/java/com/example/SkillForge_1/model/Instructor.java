package com.example.SkillForge_1.model;

import jakarta.persistence.*;

@Entity
@Table(name = "instructor")
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to UserAuthentication
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAuthentication user;

    @Column(name = "profile_pic")
    private String profilePic;

    private Integer age;

    private String designation;

    @Column(name = "phone_number")
    private String phoneNumber;

    public Instructor() {}

    public Instructor(UserAuthentication user) {
        this.user = user;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserAuthentication getUser() { return user; }
    public void setUser(UserAuthentication user) { this.user = user; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
