package com.example.lmsproject.service;

import com.example.lmsproject.entity.Admin;
import com.example.lmsproject.repository.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService implements ServiceTemplate<Admin> {

    @Autowired
    private AdminRepo adminRepo;

    public Admin create(Admin admin){
        return adminRepo.save(admin);
    }

    public Admin delete(String userId){

        Admin admin = adminRepo.findByUserId(userId);
        adminRepo.delete(admin);
        return admin;

    }

    public Admin changePassword(String userId, String password){
        Admin admin = adminRepo.findByUserId(userId);
        admin.setPassword(password);
        return adminRepo.save(admin);
    }

    public Admin update(Admin admin){
        return adminRepo.save(admin);
    }

}
