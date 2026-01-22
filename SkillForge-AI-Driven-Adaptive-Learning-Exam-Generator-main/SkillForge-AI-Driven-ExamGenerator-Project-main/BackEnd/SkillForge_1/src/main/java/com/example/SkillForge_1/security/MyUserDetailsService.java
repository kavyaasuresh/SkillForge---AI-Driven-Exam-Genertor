package com.example.SkillForge_1.security;

import com.example.SkillForge_1.model.UserAuthentication;
import com.example.SkillForge_1.repository.UserAuthenticationRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserAuthenticationRepository userRepository;

    public MyUserDetailsService(UserAuthenticationRepository userRepository) {
        this.userRepository = userRepository;
    }


    // inside your UserDetailsService loadUserByUsername
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAuthentication user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // ✅ Normalize role to uppercase and add "ROLE_" prefix
        String role = "ROLE_" + user.getRole().toUpperCase(); // user.getRole() should be 'INSTRUCTOR' in DB
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

}
