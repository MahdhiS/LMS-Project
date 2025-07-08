package com.example.lmsproject.repository;


import com.example.lmsproject.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findByDepartmentId(Long departmentId);
}

