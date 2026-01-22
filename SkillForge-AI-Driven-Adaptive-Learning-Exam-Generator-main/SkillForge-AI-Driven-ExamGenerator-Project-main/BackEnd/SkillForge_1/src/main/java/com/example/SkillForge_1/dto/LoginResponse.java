package com.example.SkillForge_1.dto;

public class LoginResponse {

    private String token;
    private String email;
    private String role;
    private Long userId;
    private String name;
    private String fullName;
    private String profilePic;
    private String phone;
    private String bio;
    private String department;

    public LoginResponse() {}

    public LoginResponse(String token, String email, String role, Long userId, String name, 
                        String fullName, String profilePic, String phone, String bio, String department) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.userId = userId;
        this.name = name;
        this.fullName = fullName;
        this.profilePic = profilePic;
        this.phone = phone;
        this.bio = bio;
        this.department = department;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getFullName() { return fullName; }
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
