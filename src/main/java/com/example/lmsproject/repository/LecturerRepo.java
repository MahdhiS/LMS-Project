package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LecturerRepo extends JpaRepository<Lecturer, String> {
    Lecturer findByLecturerID(String lecturerID);
    Lecturer findByUserId(String userId);
}
