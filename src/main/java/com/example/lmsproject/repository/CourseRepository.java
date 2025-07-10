package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDepartmentId(Long departmentId);

    List<Course> findByCourseNameContainingIgnoreCase(String courseName);

    List<Course> findCourseByCourseId(Long courseId);


    @Query("SELECT courseId FROM Course ORDER BY courseId DESC")
    List<String> findAllStudentIdsOrderByIdDesc();

    // Helper methods to get last IDs

    default String getLastCourseId() {
        List<String> ids = findAllStudentIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.getFirst();
    }
}