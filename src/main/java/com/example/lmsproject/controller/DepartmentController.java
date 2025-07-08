package com.example.lmsproject.controller;


import com.example.lmsproject.entity.Department;
import com.example.lmsproject.entity.Student;
import com.example.lmsproject.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    //create
    @PostMapping("")
    public Department addDepartment(@RequestBody Department department) {
        return departmentService.saveDetails(department);
    }

    //read

    @GetMapping("")
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/{id}")
    public Department getDepartmentById(@PathVariable long id) {
        return departmentService.getDepartmentById(id);
    }

    @GetMapping("/{id}/students")
    public List<Student> getDepartmentStudents(@PathVariable long id) {
        return departmentService.getDepartmentStudents(id);
    }

    //update
    @PutMapping("/{id}")
    public Department updateDepartment(@PathVariable long id, @RequestBody Department department) {
        return departmentService.updateDepartment(id, department);
    }

    //del
    @DeleteMapping("/delete/{id}")
    public String deleteDepartment(@PathVariable long id) {
        boolean deleted = departmentService.deleteDepartment(id);
        if (deleted) {
            return "Department deleted successfully!";
        }
        return "Department not found!";
    }





}
