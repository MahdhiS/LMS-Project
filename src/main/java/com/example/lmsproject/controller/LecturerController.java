package com.example.lmsproject.controller;

import com.example.lmsproject.entity.Lecturer;
import com.example.lmsproject.entity.PasswordChangeRequest;
import com.example.lmsproject.service.LecturerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerController {

    @Autowired
    private LecturerService lecturerService;

    // OP
    @GetMapping("/get/{lecturerId}")
    public Map<String, String> get(@PathVariable String lecturerId){

        return lecturerService.get(lecturerId);

    }

    // OP
    @PutMapping("/update/{lecturerId}")
    public ResponseEntity<String> update(@RequestBody Lecturer lecturer, @PathVariable String lecturerId){

        if(lecturerService.update(lecturer, lecturerId) != null){
            return ResponseEntity.ok("Lecturer updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer update failed");
        }
    }

    // OP
    @PutMapping ("/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody PasswordChangeRequest pwc){

        if(lecturerService.changePassword(pwc.getUserName(), pwc.getNewPassword()) != null){
            return ResponseEntity.ok("Password changed successfully");
        } else {
            return ResponseEntity.badRequest().body("Password change failed");
        }

    }

    // INOP - Pending
    @PostMapping("/attachToDept")
    public ResponseEntity<String> attachToDept(@RequestBody Lecturer lecturer){
        return ResponseEntity.ok("Attached");
    }

}
