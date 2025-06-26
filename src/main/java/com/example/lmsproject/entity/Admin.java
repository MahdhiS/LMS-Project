package com.example.lmsproject.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

public class Admin extends User {

    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private boolean isAdmin;

}
