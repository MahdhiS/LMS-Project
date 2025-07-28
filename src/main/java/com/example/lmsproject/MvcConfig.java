package com.example.lmsproject;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/login").setViewName("login");
        registry.addViewController("/admin/dashboard").setViewName("admin-dashboard");
        registry.addViewController("/lecturer/{lecturerId}").setViewName("lecturer-profile"); //Lecturer profile - Public
        registry.addViewController("/student/{studentId}").setViewName("student-profile"); //Student profile Public
        registry.addViewController("/manage-lecturer").setViewName("manage-lecturer"); // Lecturer private management
        registry.addViewController("/manage-student").setViewName("manage-student"); // Student private management

    }

}
