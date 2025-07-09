package com.example.lmsproject.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PWEncoder {

    public static String encode(String password){
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(password);
    }

}
