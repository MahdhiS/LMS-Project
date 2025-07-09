package com.example.lmsproject.controller;

import com.example.lmsproject.entity.Admin;
import com.example.lmsproject.entity.Lecturer;
import com.example.lmsproject.service.AdminService;
import com.example.lmsproject.service.LecturerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private LecturerService lecturerService;

    @PostMapping("/newAdmin")
    public ResponseEntity<String> newAdmin(@RequestBody Admin admin){

        if(adminService.create(admin) != null){
            return ResponseEntity.ok("Admin created successfully");
        } else {
            return ResponseEntity.badRequest().body("Admin creation failed");
        }

    }

    @GetMapping("/get/{adminId}")
    public Map<String, String> get(@PathVariable String adminId){

        return adminService.get(adminId);

    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody Admin admin){

        if(adminService.update(admin) != null){
            return ResponseEntity.ok("Admin updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Admin update failed");
        }
    }

    @PutMapping ("/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody Admin admin){

        if(adminService.changePassword(admin.getUserId(), admin.getPassword()) != null){
            return ResponseEntity.ok("Password changed successfully");
        } else {
            return ResponseEntity.badRequest().body("Password change failed");
        }

    }

    @PostMapping("/newLecturer")
    public ResponseEntity<String> newLecturer(@RequestBody Lecturer lecturer){

        if(lecturerService.create(lecturer) != null){
            return ResponseEntity.ok("Lecturer created successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer creation failed");
        }

    }

    @GetMapping("/get/makeLic/{lecturerId}")
    public ResponseEntity<String > makeLic(@PathVariable String lecturerId){

        lecturerService.makeLecturerLIC(lecturerId);

        return ResponseEntity.ok("Changed");

    }

    @GetMapping("/get/removeLic/{lecturerId}")
    public ResponseEntity<String > removeLic(@PathVariable String lecturerId){

        lecturerService.makeLecturerNonLIC(lecturerId);

        return ResponseEntity.ok("Changed");

    }

    @DeleteMapping("/delete/{lecturerId}")
    public ResponseEntity<String> delete(@PathVariable String lecturerId){

        if(lecturerService.delete(lecturerId)){
            return ResponseEntity.ok("Lecturer deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer deletion failed");
        }

    }

}
