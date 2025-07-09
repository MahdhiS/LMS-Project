package com.example.lmsproject.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
public class PasswordChangeRequest {

    @Id
    @Getter
    @Setter
    private String userName;

    @Getter
    @Setter
    private String newPassword;

}
