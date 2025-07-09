package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdminRepo extends JpaRepository<Admin, String> {

    Admin findByUsername(String username);
    Admin findByUserId(String userID);

    @Query("SELECT u.id FROM User u ORDER BY u.id DESC")
    List<String> findAllUserIdsOrderByIdDesc();

    default String getLastUserID() {
        List<String> ids = findAllUserIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.getFirst();
    }

}
