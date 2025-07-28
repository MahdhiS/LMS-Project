package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Admin;
import com.example.lmsproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, String> {

    User findByUsername(String username);

}
