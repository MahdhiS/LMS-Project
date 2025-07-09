package com.example.lmsproject.service;

import com.example.lmsproject.entity.Lecturer;
import com.example.lmsproject.repository.LecturerRepo;
import com.example.lmsproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class LecturerService implements UserService<Lecturer> {

    @Autowired
    private LecturerRepo lecturerRepo;

    public Lecturer create(Lecturer lecturer){

        String lastLecturerID = lecturerRepo.getLastLecturerID();
        String lastUserID = lecturerRepo.getLastUserID();

        if(lastUserID != null){
            lecturer.setUserId(Utils.nextId(lastUserID));
        } else {
            lecturer.setUserId("USER-0000001");
        }

        if(lastLecturerID != null){
            lecturer.setLecturerID(Utils.nextId(lastLecturerID));
        } else {
            lecturer.setLecturerID("LEC-00001");
        }

        lecturer.setRole("LECTURER");

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

    public boolean delete(String lecturerID){
        Lecturer lecturer = lecturerRepo.findByLecturerID(lecturerID);

        if(lecturer == null){
            return false;
        }

        lecturerRepo.delete(lecturer);
        return true;
    }

    public Lecturer update(Lecturer lecturer){
        return lecturerRepo.save(lecturer);
    }

    public Map<String, String> get(String lecturerID){
        Lecturer lecturer = lecturerRepo.findByLecturerID(lecturerID);

        Map<String, String> lecturerMap = new HashMap<>();
        lecturerMap.put("lecturerID", lecturer.getLecturerID());
        lecturerMap.put("email", lecturer.getEmail());
        lecturerMap.put("phone", lecturer.getPhone());
        lecturerMap.put("isLIC", String.valueOf(lecturer.isLIC()));

        return lecturerMap;
    }

    public boolean addLecturerToDepartment(Lecturer lecturer, String departmentID){

        //lecturer.set // Department

        return true;

    }

}
