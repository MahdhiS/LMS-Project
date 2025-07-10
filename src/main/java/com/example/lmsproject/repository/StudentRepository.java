package com.example.lmsproject.repository;


import com.example.lmsproject.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findByDepartmentId(Long departmentId);

    Student findByStudentId(String StudentId);

    Student findByUsername(String username);

    @Query("SELECT u.userId FROM User u ORDER BY u.userId DESC")
    List<String> findAllUserIdsOrderByIdDesc();

    @Query("SELECT studentId FROM Student ORDER BY studentId DESC")
    List<String> findAllStudentIdsOrderByIdDesc();

    // Helper methods to get last IDs
    default String getLastUserID() {
        List<String> ids = findAllUserIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.getFirst();
    }

    default String getLastStudentId() {
        List<String> ids = findAllStudentIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.getFirst();
    }
}



