package com.example.lmsproject.entity;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
abstract class User {

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String userId;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String username;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String password;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String firstName;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String lastName;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String email;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String phone;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String dateOfBirth;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String gender;

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String address;

}
