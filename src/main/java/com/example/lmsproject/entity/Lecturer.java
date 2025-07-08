//package com.example.lmsproject.entity;
//
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//public class Lecturer extends User {
//
//    /*
//    @Getter
//    @Setter
//    protected Department department;
//
//     */
//    @Getter
//    @Setter
//    @Column(name = "lecturer_id")
//    private String lecturerID;
//
//    @ManyToMany
//    @JoinTable(
//            name = "lecturer_course",
//            joinColumns = @JoinColumn(name = "lecturer_id"),
//            inverseJoinColumns = @JoinColumn(name = "course_id")
//    )
//    @Getter
//    @Setter
//    private List<Course> lecturingCourses = new ArrayList<>();
//
//
//    @Getter
//    @Setter
//    @Column(name = "is_lic")
//    private boolean isLIC;
//
//}
