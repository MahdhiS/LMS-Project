package com.example.lmsproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "departments")
public class Department {

    @Id

    private String departmentId;

    @Column(nullable = false)
    private String name;

    private String description;

    // ONE-TO-MANY: One department has many students
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @JsonManagedReference  // ADD THIS LINE
    @JsonIgnore
    private List<Student> students = new ArrayList<>();

    // ONE-TO-MANY: Department has many courses
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Course> courses = new ArrayList<>();

//    // ONE-TO-MANY: Department has many lecturers
//    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    @JsonIgnore
//    private List<Lecturer> lecturers = new ArrayList<>();

    public Department(String name, String description, List<Student> students) {
        this.name = name;
        this.description = description;
        this.students = students;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Student> getStudents() {
        return students;
    }

    public void setStudents(List<Student> students) {
        this.students = students;
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }

//    public List<Lecturer> getLecturers() {
//        return lecturers;
//    }
//
//    public void setLecturers(List<Lecturer> lecturers) {
//        this.lecturers = lecturers;
//    }
}