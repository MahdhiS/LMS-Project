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
        registry.addViewController("/department-management").setViewName("department-management");
        registry.addViewController("/course-management").setViewName("course-management");
    }

}
