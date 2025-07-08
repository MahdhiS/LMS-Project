package com.example.lmsproject.service;


import com.example.lmsproject.entity.Student;
import com.example.lmsproject.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;



    public Student saveDetails(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> saveAllDetails(List<Student> student) {
        return studentRepository.saveAll(student);
    }

    public Student getStudentById(String id){
        return studentRepository.findById(id).orElse(null);
    }

    public List<Student> getStudentsByDepartmentId(Long departmentId){
        return studentRepository.findByDepartmentId(departmentId);
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

}
