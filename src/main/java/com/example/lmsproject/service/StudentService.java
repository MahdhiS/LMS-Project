package com.example.lmsproject.service;


import com.example.lmsproject.auth.PWEncoder;
import com.example.lmsproject.entity.Department;
import com.example.lmsproject.entity.Student;
import com.example.lmsproject.repository.DepartmentRepository;
import com.example.lmsproject.repository.StudentRepository;
import com.example.lmsproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;


    public Student saveDetails(Student student) {

        String lastUserID = studentRepository.getLastUserID();
        if(lastUserID != null){
            student.setUserId(Utils.nextId(lastUserID));
        } else {
            student.setUserId("USER-0000001");
        }

        String lastStudentId = studentRepository.getLastStudentId();
        if(lastStudentId != null){
            student.setStudentId(Utils.nextId(lastStudentId));
        }
        else {
            student.setStudentId("STD-0000001");
        }

        student.setRole("STUDENT");
        student.setPassword(PWEncoder.encode(student.getPassword()));

        return studentRepository.save(student);
    }

    public List<Student> saveAllDetails(List<Student> student) {
        return studentRepository.saveAll(student);
    }

    public Student getStudentById(String id){
        return studentRepository.findById(id).orElse(null);
    }


    public List<Student> getStudentsByDepartmentId(String departmentId){
        return studentRepository.findByDepartmentDepartmentId(departmentId);
    }

    public List<Student> getAllStudents(){
        return studentRepository.findAll();
    }

    public Student updateDetails(String id, Student updatedStudent) {
        Student student = studentRepository.findById(id).orElse(null);
        if (student != null) {
            student.setFirstName(updatedStudent.getFirstName());
            student.setLastName(updatedStudent.getLastName());
            student.setEmail(updatedStudent.getEmail());
            return studentRepository.save(student);
        }
        return null;
    }


    public boolean deleteStudent(String id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Student assignStudentToDepartment(String userId, String departmentId) {
        Student student = studentRepository.findById(userId).orElse(null);
        if (student != null) {
            Department department = departmentRepository.findByDepartmentId(departmentId);
            student.setDepartment(department);
            return studentRepository.save(student);
        }
        return null;
    }

//    @Transactional
//    public Student assignStudentToDepartment(String userId, Long departmentId) {
//        try {
//            System.out.println("=== ASSIGNMENT DEBUG START ===");
//            System.out.println("Looking for userId: " + userId);
//            System.out.println("Looking for departmentId: " + departmentId);
//
//            // Check if student exists first
//            boolean studentExists = studentRepository.existsById(userId);
//            System.out.println("Student exists: " + studentExists);
//
//            if (!studentExists) {
//                System.out.println("ERROR: Student with userId " + userId + " does not exist");
//                return null;
//            }
//
//            Student student = studentRepository.findById(userId).orElse(null);
//            System.out.println("Student retrieved: " + (student != null ? student.getFirstName() : "NULL"));
//
//            if (student != null) {
//                // Check if department exists
//                boolean deptExists = departmentRepository.existsById(departmentId);
//                System.out.println("Department exists: " + deptExists);
//
//                if (!deptExists) {
//                    System.out.println("ERROR: Department with id " + departmentId + " does not exist");
//                    return null;
//                }
//
//                Department department = departmentRepository.findById(departmentId).orElse(null);
//                System.out.println("Department retrieved: " + (department != null ? department.getName() : "NULL"));
//
//                if (department != null) {
//                    System.out.println("Setting department...");
//                    student.setDepartment(department);
//
//                    System.out.println("Saving student...");
//                    Student savedStudent = studentRepository.save(student);
//
//                    System.out.println("SUCCESS: Assignment completed!");
//                    return savedStudent;
//                }
//            }
//
//            System.out.println("Assignment failed - returning null");
//            return null;
//
//        } catch (Exception e) {
//            System.out.println("EXCEPTION in assignStudentToDepartment:");
//            System.out.println("Exception type: " + e.getClass().getSimpleName());
//            System.out.println("Exception message: " + e.getMessage());
//            e.printStackTrace();
//            throw e; // Re-throw to see full stack trace
//        }
//    }





}
