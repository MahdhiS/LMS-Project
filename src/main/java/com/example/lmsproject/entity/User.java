package com.example.lmsproject.entity;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
abstract class User {

    @Getter
    @Setter
    private String userId;

    @Getter
    @Setter
    private String username;

    @Getter
    @Setter
    private String password;

    @Getter
    @Setter
    private String firstName;

    @Getter
    @Setter
    private String lastName;

    @Getter
    @Setter
    private String email;

    @Getter
    @Setter
    private String phone;

    @Getter
    @Setter
    private String dateOfBirth;

    @Getter
    @Setter
    private String gender;

    @Getter
    @Setter
    private String address;

}
