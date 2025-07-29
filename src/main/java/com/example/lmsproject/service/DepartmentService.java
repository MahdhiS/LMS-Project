package com.example.lmsproject.service;

import com.example.lmsproject.entity.Department;
import com.example.lmsproject.entity.Student;
import com.example.lmsproject.repository.DepartmentRepository;
import com.example.lmsproject.repository.StudentRepository;
import com.example.lmsproject.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private StudentRepository studentRepository;

    public Department saveDetails(Department department) {

        String lastDepartmenId = departmentRepository.getLastdepartmentId();
        if(lastDepartmenId != null){
            department.setDepartmentId(Utils.nextId(lastDepartmenId));
        }
        else {
            department.setDepartmentId("DEP-00001");
        }

        return departmentRepository.save(department);
    }

    public Department getDepartmentById(String id) {
        return departmentRepository.findByDepartmentId(id);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    //one to many
    public List<Student> getDepartmentStudents(String id) {
        Department department = getDepartmentById(id);
        if (department != null) {
            return department.getStudents();
        }
        return null;
    }

    public boolean deleteDepartment(String id) {
        Department department = departmentRepository.findByDepartmentId(id);
        if (department != null) {
            // Set students department to null
            for (Student student : department.getStudents()) {
                student.setDepartment(null);
                studentRepository.save(student);
            }

            // Then delete the department
            departmentRepository.delete(department);
            return true;
        }
        return false;
    }

    public Department updateDepartment(String id, Department departmentDetails) {
        Department department = departmentRepository.findByDepartmentId(id);
        if (department != null) {
            department.setName(departmentDetails.getName());
            department.setDescription(departmentDetails.getDescription());
            return departmentRepository.save(department);
        }
        return null;
    }


}
