package com.example.lmsproject.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user")
abstract class User {

    @Id
    @Getter
    @Setter
    @Column(name = "user_id")
    private String userId;

    @Getter
    @Setter
    @Column(name = "username")
    private String username;

    @Getter
    @Setter
    @Column(name = "password")
    private String password;

    @Getter
    @Setter
    @Column(name = "first_name")
    private String firstName;

    @Getter
    @Setter
    @Column(name = "last_name")
    private String lastName;

    @Getter
    @Setter
    @Column(name = "email")
    private String email;

    @Getter
    @Setter
    @Column(name = "phone")
    private String phone;

    @Getter
    @Setter
    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Getter
    @Setter
    @Column(name = "gender")
    private String gender;

    @Getter
    @Setter
    @Column(name = "role")
    private String role;

}
