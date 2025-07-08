package com.example.lmsproject.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "students")
public class Student extends User {

    @Column(name = "student_id", unique = true, updatable = false)
    private String studentId;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = true)
//    @JsonBackReference  // ADD THIS LINE
    private Department department;

    public Student() {
        super();
    }

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


}