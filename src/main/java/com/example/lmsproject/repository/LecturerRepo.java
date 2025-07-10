package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LecturerRepo extends JpaRepository<Lecturer, String> {

    Lecturer findByLecturerID(String lecturerID);
    Lecturer findByUsername(String username);

    @Query("SELECT u.userId FROM User u ORDER BY u.userId DESC")
    List<String> findAllUserIdsOrderByIdDesc();

    @Query("SELECT lecturerID FROM Lecturer ORDER BY lecturerID DESC")
    List<String> findAllLecturerIdsOrderByIdDesc();

    // Helper methods to get last IDs
    default String getLastUserID() {
        List<String> ids = findAllUserIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.getFirst();
    }

    default String getLastLecturerID() {
        List<String> ids = findAllLecturerIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.getFirst();
    }


}
