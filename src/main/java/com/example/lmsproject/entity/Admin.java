package com.example.lmsproject.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;


@Entity
public class Admin extends User {

    @Getter
    @Setter
    @Column(name = "is_admin")
    private boolean isAdmin;

}
