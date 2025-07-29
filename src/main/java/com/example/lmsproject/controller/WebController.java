package com.example.lmsproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class WebController {

    @GetMapping("/lecturer/{lecturerId}")
    public String lecturerProfile(@PathVariable String lecturerId, Model model) {
        model.addAttribute("lecturerId", lecturerId);
        return "lecturer-profile";
    }

    @GetMapping("/manage-lecturer")
    public String manageLecturer() {
        return "manage-lecturer";
    }

    @GetMapping("/manage-student")
    public String manageStudent() {
        return "manage-student";
    }

    @GetMapping("/course-view")
    public String courseView() {
        return "course-view";
    }
}
