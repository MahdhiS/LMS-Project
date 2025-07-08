package com.example.lmsproject.service;

import com.example.lmsproject.entity.Lecturer;
import com.example.lmsproject.repository.LecturerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LecturerService implements ServiceTemplate<Lecturer> {

    @Autowired
    private LecturerRepo lecturerRepo;

    public Lecturer create(Lecturer lecturer){
        return lecturerRepo.save(lecturer);
    }

    public Lecturer changePassword(String lecturerID, String password){
        Lecturer lecturer = lecturerRepo.findByLecturerID(lecturerID);
        lecturer.setPassword(password);
        return lecturerRepo.save(lecturer);
    }

    public Lecturer makeLecturerLIC(String lecturerID){

        Lecturer lecturer = lecturerRepo.findByLecturerID(lecturerID);
        lecturer.setLIC(true);
        return lecturerRepo.save(lecturer);

    }

    public Lecturer makeLecturerNonLIC(String lecturerID){
        Lecturer lecturer = lecturerRepo.findByLecturerID(lecturerID);
        lecturer.setLIC(false);
        return lecturerRepo.save(lecturer);
    }

    public Lecturer delete(String lecturerID){
        Lecturer lecturer = lecturerRepo.findByLecturerID(lecturerID);
        lecturerRepo.delete(lecturer);
        return lecturer;
    }

    public Lecturer update(Lecturer lecturer){
        return lecturerRepo.save(lecturer);
    }

}
