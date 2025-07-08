package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepo extends JpaRepository<Admin, String> {
    Admin findByUsername(String username);
    Admin findByUserId(String userId);
}
