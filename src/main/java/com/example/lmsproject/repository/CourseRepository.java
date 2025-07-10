package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByDepartmentId(Long departmentId);

    List<Course> findCourseByCourseId(Long courseId);


    @Query("SELECT courseId FROM Course ORDER BY courseId DESC")
    List<String> findAllCourseIdsOrderByIdDesc();

    // Helper methods to get last IDs

    default String getLastCourseId() {
        List<String> ids = findAllCourseIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.getFirst();
    }
}