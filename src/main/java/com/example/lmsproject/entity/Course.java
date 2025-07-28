package com.example.lmsproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    private String courseId;

    @Column(nullable = false, unique = true)
    private String courseName;

    // MANY-TO-ONE: Many courses belong to one department
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    // MANY-TO-MANY: Course has many students
    @ManyToMany(mappedBy = "courses", fetch = FetchType.LAZY)
    @JsonIgnore // Prevent circular reference
    private List<Student> students = new ArrayList<>();

    // MANY-TO-MANY: Course has many lecturers
    @ManyToMany(mappedBy = "lecturingCourses", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Lecturer> lecturers = new ArrayList<>();


    public Course(String courseName, Department department, List<Student> students, List<Lecturer> lecturers) {
        this.courseName = courseName;
        this.department = department;
        this.students = students;
        this.lecturers = lecturers;
    }


}

