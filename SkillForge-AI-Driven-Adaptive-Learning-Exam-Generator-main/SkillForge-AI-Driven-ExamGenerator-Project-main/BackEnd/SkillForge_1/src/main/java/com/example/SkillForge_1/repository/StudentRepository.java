package com.example.SkillForge_1.repository;

import com.example.SkillForge_1.model.Student;
import com.example.SkillForge_1.model.UserAuthentication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student,Long> {
    Optional<Student> findByUser_Id(Long userId);
    Optional<Student> findByUser(UserAuthentication user);
    
    @Query("SELECT s FROM Student s JOIN FETCH s.user WHERE s.user.role = 'STUDENT'")
    List<Student> findAllStudentsWithUser();
    
    @Override
    @Query("SELECT s FROM Student s JOIN FETCH s.user")
    List<Student> findAll();
}
