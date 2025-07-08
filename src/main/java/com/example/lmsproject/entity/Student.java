package com.example.lmsproject.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "students")
public class Student extends User {

    @Column(name = "student_id", unique = true, updatable = false)
    private String studentId;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = true)
//    @JsonBackReference  // ADD THIS LINE
    private Department department;


    // MANY-TO-MANY: Student has many courses
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "student_enrollments",
            joinColumns = @JoinColumn(name = "student_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses = new ArrayList<>();


    public Student(String userId, String username, String password, String firstName, String lastName, String email, String phone, String dateOfBirth, String gender, String studentId) {
        super(userId, username, password, firstName, lastName, email, phone, dateOfBirth, gender);
        this.studentId = studentId;
        this.department = null;
    }

    public Student(String userId, String username, String password, String firstName, String lastName, String email, String phone, String dateOfBirth, String gender, String studentId, Department department) {
        super(userId, username, password, firstName, lastName, email, phone, dateOfBirth, gender);
        this.studentId = studentId;
        this.department = department;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }
}