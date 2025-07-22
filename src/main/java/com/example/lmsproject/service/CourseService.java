package com.example.lmsproject.service;

import com.example.lmsproject.entity.Course;
import com.example.lmsproject.entity.Department;
import com.example.lmsproject.entity.Student;
import com.example.lmsproject.repository.CourseRepository;
import com.example.lmsproject.repository.DepartmentRepository;
import com.example.lmsproject.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;


    public Course saveCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    public List<Course> getCoursesByDepartment(Long departmentId) {
        return courseRepository.findByDepartmentId(departmentId);
    }

    public Course updateCourse(Long id, Course updatedCourse) {
        Course course = courseRepository.findById(id).orElse(null);
        if (course != null) {
            course.setCourseName(updatedCourse.getCourseName());
            course.setDepartment(updatedCourse.getDepartment());
            return courseRepository.save(course);
        }
        return null;
    }

    public boolean deleteCourse(Long id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
            return true;
        }
        return false;
    }

    //enroll
    public Course enrollStudentInCourse(String studentId, Long courseId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);

        if (student == null) {
            System.out.println("Student not found");
            return null;
        }
        if (course == null) {
            System.out.println("Course not found");
            return null;

        }

        // check if already enrolled
        if (student.getCourses().contains(course)) {
            System.out.println("Student already enrolled");
            return null;
        }

        //if all cases passes enroll student to the course

        student.getCourses().add(course);
        studentRepository.save(student);

        return course;
    }


    public Course dropStudentFromCourse(String studentId, Long courseId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        Course course = courseRepository.findById(courseId).orElse(null);

        if (student == null) {
            System.out.println("Student not found");
            return null;
        }
        if (course == null) {
            System.out.println("Course not found");
            return null;
        }

        // Check if enrolled
        if (!student.getCourses().contains(course)) {
            System.out.println("Student not enrolled");
            return null;
        }

        // Remove course from student's course list
        student.getCourses().remove(course);
        studentRepository.save(student);

        System.out.println("Student successfully dropped");
        return course;
    }

   // get all courses a student is enrolled to
    public List<Course> getStudentCourses(String studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student != null) {
            return student.getCourses();
        }
        return null;
    }

    // get all students enrolled for a course
    public List<Student> getCourseStudents(Long courseId) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course != null) {
            return course.getStudents();
        }
        return null;
    }
}