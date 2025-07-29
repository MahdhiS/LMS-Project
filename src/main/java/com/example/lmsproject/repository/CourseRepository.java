package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {

    Course findByCourseId(String courseId);

    List<Course> findByDepartmentId(String departmentId);

    Optional<Course> findByCourseName(String courseName);

    boolean existsByCourseId(String courseId);

    boolean existsByCourseName(String courseName);

    @Query("SELECT courseId FROM Course ORDER BY courseId DESC")
    List<String> findAllCourseIdsOrderByIdDesc();

    // Helper methods to get last IDs
    default String getLastCourseId() {
        List<String> ids = findAllCourseIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.get(0);
    }

}