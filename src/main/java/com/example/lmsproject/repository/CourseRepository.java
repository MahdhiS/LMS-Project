package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// CourseRepository.java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDepartmentId(Long departmentId);
    List<Course> findByCourseNameContainingIgnoreCase(String courseName);
    List<Course> findCourseByCourseId(Long courseId);
}