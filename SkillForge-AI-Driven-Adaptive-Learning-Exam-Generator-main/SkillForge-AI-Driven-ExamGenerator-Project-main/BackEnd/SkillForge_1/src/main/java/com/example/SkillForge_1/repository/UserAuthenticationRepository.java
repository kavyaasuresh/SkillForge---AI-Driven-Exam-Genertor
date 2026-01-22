package com.example.SkillForge_1.repository;

import com.example.SkillForge_1.model.UserAuthentication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface UserAuthenticationRepository extends JpaRepository<UserAuthentication, Long> {
    Optional<UserAuthentication> findByEmail(String email);

    @Override
    Optional<UserAuthentication> findById(Long id);
    Optional<UserAuthentication> findByName(String name);
}
