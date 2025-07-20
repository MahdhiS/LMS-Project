package com.example.lmsproject.repository;

import com.example.lmsproject.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {

    Department findByDepartmentId(String departmentId);

    @Query("SELECT departmentId FROM Department ORDER BY departmentId DESC")
    List<String> findAllDepartmentIdsOrderByIdDesc();

    // Helper methods to get last IDs
    default String getLastdepartmentId() {
        List<String> ids = findAllDepartmentIdsOrderByIdDesc();
        return ids.isEmpty() ? null : ids.get(0);
    }
}
