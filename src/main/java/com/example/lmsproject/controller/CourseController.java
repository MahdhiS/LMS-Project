package com.example.lmsproject.controller;

import com.example.lmsproject.entity.Course;
import com.example.lmsproject.entity.Student;
import com.example.lmsproject.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // BASIC CRUD OPERATIONS
    @PostMapping("")
    public Course createCourse(@RequestBody Course course) {
        return courseService.saveCourse(course);
    }

    @GetMapping("")
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable String id) {
        return courseService.getCourseById(id);
    }

    @GetMapping("/department/{departmentId}")
    public List<Course> getCoursesByDepartment(@PathVariable String departmentId) {
        return courseService.getCoursesByDepartment(departmentId);
    }

    @GetMapping("/{courseId}/students")
    public List<Student> getCourseStudents(@PathVariable String courseId) {
        return courseService.getCourseStudents(courseId);
    }

    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable String id, @RequestBody Course course) {
        return courseService.updateCourse(id, course);
    }



    // enroll
    @PostMapping("/{courseId}/enroll/{studentId}")
    public Course enrollStudent(
            @PathVariable String courseId,
            @PathVariable String studentId) {

      return courseService.enrollStudentInCourse(studentId, courseId);

    }


    @DeleteMapping("/{id}")
    public boolean deleteCourse(@PathVariable String id) {
        return courseService.deleteCourse(id);
    }

    @DeleteMapping("/{courseId}/drop/{studentId}")
    public Course dropStudent(
            @PathVariable String courseId,
            @PathVariable String studentId) {

        return courseService.dropStudentFromCourse(studentId, courseId);

    }


}