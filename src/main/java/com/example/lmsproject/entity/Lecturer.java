package com.example.lmsproject.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Lecturer extends User {

    @ManyToOne(fetch = FetchType.EAGER)
    @Getter
    @Setter
    private Department department;


    @Getter
    @Setter
    @Column(name = "lecturer_id")
    private String lecturerID;


    @ManyToMany
    @JoinTable(
            name = "lecturer_course",
            joinColumns = @JoinColumn(name = "lecturer_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    @Getter
    @Setter
    private List<Course> lecturingCourses = new ArrayList<>();




    @Getter
    @Setter
    @Column(name = "is_lic")
    private boolean isLIC;

}
