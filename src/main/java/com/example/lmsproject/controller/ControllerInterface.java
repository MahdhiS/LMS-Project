package com.example.lmsproject.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public interface ControllerInterface {

    public Map<String, String> get();

}
