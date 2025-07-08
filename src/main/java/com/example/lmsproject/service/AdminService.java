package com.example.lmsproject.service;

import com.example.lmsproject.entity.Admin;
import com.example.lmsproject.repository.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService implements UserService<Admin> {

    @Autowired
    private AdminRepo adminRepo;

    public Admin create(Admin admin){
        return adminRepo.save(admin);
    }

    public boolean delete(String userName){

        Admin admin = adminRepo.findByUsername(userName);

        if(admin == null){
            return false;
        }

        adminRepo.delete(admin);
        return true;

    }

    public Admin changePassword(String userName, String password){
        Admin admin = adminRepo.findByUsername(userName);
        admin.setPassword(password);
        return adminRepo.save(admin);
    }

    public Admin update(Admin admin){
        return adminRepo.save(admin);
    }

    public Map<String, String> get(String userName){
        Admin admin = adminRepo.findByUsername(userName);

        Map<String , String> adminMap = new HashMap<>();
        adminMap.put("userName", admin.getUsername());
        adminMap.put("email", admin.getEmail());
        adminMap.put("phone", admin.getPhone());

        return adminMap;
    }

}
