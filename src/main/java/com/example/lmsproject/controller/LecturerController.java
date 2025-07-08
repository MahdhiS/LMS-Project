package com.example.lmsproject.controller;

import com.example.lmsproject.entity.Lecturer;
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

    @GetMapping("/get/{lecturerId}")
    public Map<String, String> get(@PathVariable String lecturerId){

        return lecturerService.get(lecturerId);

    }

    @PostMapping("/new")
    public ResponseEntity<String> newLecturer(@RequestBody Lecturer lecturer){

        if(lecturerService.create(lecturer) != null){
            return ResponseEntity.ok("Lecturer created successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer creation failed");
        }

    }

    @DeleteMapping("/delete/{lecturerId}")
    public ResponseEntity<String> delete(@PathVariable String lecturerId){

        if(lecturerService.delete(lecturerId)){
            return ResponseEntity.ok("Lecturer deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer deletion failed");
        }

    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody Lecturer lecturer){

        if(lecturerService.update(lecturer) != null){
            return ResponseEntity.ok("Lecturer updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Lecturer update failed");
        }
    }

    @PutMapping("/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody Lecturer lecturer){

        if(lecturerService.changePassword(lecturer.getUserId(), lecturer.getPassword()) != null){
            return ResponseEntity.ok("Password changed successfully");
        } else {
            return ResponseEntity.badRequest().body("Password change failed");
        }

    }

}
