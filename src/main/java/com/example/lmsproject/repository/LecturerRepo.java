package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LecturerRepo extends JpaRepository<Lecturer, String> {

    Lecturer findByLecturerID(String lecturerID);
    Lecturer findByUsername(String username);

    @Query("SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1")
    String getLastUserID();

    @Query("SELECT lecturer_id FROM lecturers ORDER BY lecturer_id DESC LIMIT 1")
    String getLastLecturerID();

}
