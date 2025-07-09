package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AdminRepo extends JpaRepository<Admin, String> {

    Admin findByUsername(String username);
    Admin findByUserId(String userID);

    @Query("SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1")
    String getLastUserID();
}
