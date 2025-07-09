package com.example.lmsproject.controller;

import com.example.lmsproject.entity.Admin;
import com.example.lmsproject.entity.Lecturer;
import com.example.lmsproject.entity.PasswordChangeRequest;
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

    // OP
    @PostMapping("/newAdmin")
    public ResponseEntity<String> newAdmin(@RequestBody Admin admin){

        if(adminService.create(admin) != null){
            return ResponseEntity.ok("Admin created successfully");
        } else {
            return ResponseEntity.badRequest().body("Admin creation failed");
        }

    }

    // OP
    @GetMapping("/get/{adminId}")
    public Map<String, String> get(@PathVariable String adminId){

        return adminService.get(adminId);

    }

    // OP
    @PutMapping("/update/{adminUserName}")
    public ResponseEntity<String> update(@RequestBody Admin admin, @PathVariable String adminUserName){

        if(adminService.update(admin, adminUserName) != null){
            return ResponseEntity.ok("Admin updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Admin update failed");
        }
    }

    // OP
    @PutMapping ("/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody PasswordChangeRequest pwc){

        if(adminService.changePassword(pwc.getUserName(), pwc.getNewPassword()) != null){
            return ResponseEntity.ok("Password changed successfully");
        } else {
            return ResponseEntity.badRequest().body("Password change failed");
        }

    }

    // OP
    @DeleteMapping("/deleteAdmin/{adminUserName}")
    public ResponseEntity<String> deleteAdmin(@PathVariable String adminUserName){

        if(adminService.delete(adminUserName)){
            return ResponseEntity.ok("Admin deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("Admin deletion failed");
        }

    }

    // OP
    @PostMapping("/newLecturer")
    public ResponseEntity<String> newLecturer(@RequestBody Lecturer lecturer){

        if(lecturerService.create(lecturer) != null){
            return ResponseEntity.ok("Lecturer created successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer creation failed");
        }

    }

    // OP
    @GetMapping("/makeLic/{lecturerId}")
    public ResponseEntity<String > makeLic(@PathVariable String lecturerId){

        lecturerService.makeLecturerLIC(lecturerId);

        return ResponseEntity.ok("Changed");

    }

    // OP
    @GetMapping("/removeLic/{lecturerId}")
    public ResponseEntity<String > removeLic(@PathVariable String lecturerId){

        lecturerService.makeLecturerNonLIC(lecturerId);

        return ResponseEntity.ok("Changed");

    }

    // OP
    @DeleteMapping("/deleteLecturer/{lecturerId}")
    public ResponseEntity<String> deleteLecturer(@PathVariable String lecturerId){

        if(lecturerService.delete(lecturerId)){
            return ResponseEntity.ok("Lecturer deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer deletion failed");
        }

    }

}
