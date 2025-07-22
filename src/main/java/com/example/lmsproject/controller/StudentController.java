package com.example.lmsproject.controller;

import com.example.lmsproject.entity.Course;
import com.example.lmsproject.entity.Student;
import com.example.lmsproject.service.CourseService;
import com.example.lmsproject.service.DepartmentService;
import com.example.lmsproject.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;
    @Autowired
    private DepartmentService departmentService;
    @Autowired
    private CourseService courseService;

    //create
    @PostMapping("")
    public Student addStudent(@RequestBody Student student) {
        return studentService.saveDetails(student);
    }

    @PostMapping("/batch")
    public List<Student> addStudentLists(@RequestBody List<Student> students) {
        return studentService.saveAllDetails(students);
    }


    // read
    @GetMapping("")
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable String id) {
        return studentService.getStudentById(id);
    }


    //update
    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable String id, @RequestBody Student student) {
        return studentService.updateDetails(id, student);
    }


    @DeleteMapping("/delete/{id}")
    public String deleteStudent(@PathVariable String id) {
        boolean deleted = studentService.deleteStudent(id);
        if (deleted) {
            return "Student deleted successfully!";
        }
        return "Student not found!";
    }


    //enroll to department
    @PutMapping("/{userId}/assign-department/{departmentId}")
    public Student assignStudentToDepartment(
            @PathVariable String userId,
            @PathVariable Long departmentId) {
        return studentService.assignStudentToDepartment(userId, departmentId);
    }

    @GetMapping("/department/{departmentId}")
    public List<Student> getStudentsByDepartment(@PathVariable Long departmentId) {
        return studentService.getStudentsByDepartmentId(departmentId);
    }


    //course
    @GetMapping("/{studentId}/courses")
    public List<Course> getStudentCourses(@PathVariable String studentId) {
        return courseService.getStudentCourses(studentId);
    }

    @PostMapping("/{studentId}/enroll/{courseId}")
    public Course enrollInCourse(
            @PathVariable String studentId,
            @PathVariable Long courseId) {

        return courseService.enrollStudentInCourse(studentId, courseId);

    }


    @DeleteMapping("/{studentId}/drop/{courseId}")
    public Course dropCourse(
            @PathVariable String studentId,
            @PathVariable Long courseId) {

       return courseService.dropStudentFromCourse(studentId, courseId);

    }


}
