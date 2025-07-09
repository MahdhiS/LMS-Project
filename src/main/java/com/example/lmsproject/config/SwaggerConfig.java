package com.example.lmsproject.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;



// http://localhost:8080/swagger-ui/index.html
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Learning Management System (LMS) API")
                        .version("1.0.0")
                        .description("A comprehensive LMS API for managing students, courses, departments, and enrollments. " +
                                "This API provides endpoints for CRUD operations on educational entities and student enrollment management.")
                        .contact(new Contact()
                                .name("MahdhiS")
                                .email("mahdhi.dev@gmail.com")
                                .url("https://github.com/MahdhiS/LMS-Project"))
                        .contact(new Contact()
                                .name("ravindutw")
                                .email("ravindutw@gmail.com")
                                .url("https://github.com/ravindutw/LMS-Project"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}