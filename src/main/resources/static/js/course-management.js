// Course Management JavaScript
class CourseManager {
    constructor() {
        this.courses = [];
        this.departments = [];
        this.students = [];
        this.currentEditId = null;
        this.currentCourseId = null;
        this.init();
    }

    init() {
        this.loadCourses();
        this.loadDepartments();
        this.loadStudents();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterCourses(e.target.value);
        });

        // Department filter
        document.getElementById('departmentFilter').addEventListener('change', (e) => {
            this.filterByDepartment(e.target.value);
        });

        // Form submission
        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourse();
        });
    }

    async loadCourses() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/courses');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.courses = await response.json();
            this.renderCourses();
            this.updateStatistics();
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showError('Failed to load courses. Please try again.');
            this.showLoading(false);
        }
    }

    async loadDepartments() {
        try {
            const response = await fetch('/api/departments');
            if (response.ok) {
                this.departments = await response.json();
                this.populateDepartmentOptions();
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    async loadStudents() {
        try {
            const response = await fetch('/api/students');
            if (response.ok) {
                this.students = await response.json();
                this.populateStudentOptions();
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    populateDepartmentOptions() {
        const courseSelect = document.getElementById('courseDepartment');
        const filterSelect = document.getElementById('departmentFilter');

        // Clear existing options (except first one)
        courseSelect.innerHTML = '<option value="">Select Department</option>';
        filterSelect.innerHTML = '<option value="">All Departments</option>';

        this.departments.forEach(dept => {
            const option1 = new Option(dept.name, dept.departmentId);
            const option2 = new Option(dept.name, dept.departmentId);
            courseSelect.appendChild(option1);
            filterSelect.appendChild(option2);
        });
    }

    populateStudentOptions() {
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">Choose a student...</option>';

            this.students.forEach(student => {
                const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
                const displayName = fullName || student.username || student.studentId;
                const option = new Option(`${displayName} (${student.studentId})`, student.studentId);
                studentSelect.appendChild(option);
            });
        }
    }

    renderCourses(coursesToRender = this.courses) {
        const tbody = document.getElementById('coursesTableBody');
        const emptyState = document.getElementById('emptyState');
        const tableCard = document.querySelector('.card:has(#coursesTableBody)').closest('.card');

        if (coursesToRender.length === 0) {
            tbody.innerHTML = '';
            tableCard.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tableCard.style.display = 'block';
        emptyState.style.display = 'none';

        tbody.innerHTML = coursesToRender.map(course => `
            <tr>
                <td>
                    <strong class="text-primary">${this.escapeHtml(course.courseId)}</strong>
                </td>
                <td>
                    <div class="fw-medium">${this.escapeHtml(course.courseName)}</div>
                </td>
                <td>
                    <span class="badge bg-secondary">${course.department ? this.escapeHtml(course.department.name) : 'No Department'}</span>
                </td>
                <td>
                    <button class="btn btn-link p-0 text-decoration-none" onclick="courseManager.viewCourseStudents('${course.courseId}')">
                        <span class="badge bg-info student-count-badge">
                            <i class="bi bi-people me-1"></i>
                            <span id="studentCount_${course.courseId}">Loading...</span>
                        </span>
                    </button>
                </td>
                <td>
                    <button class="btn btn-link p-0 text-decoration-none" onclick="courseManager.viewCourseLecturers('${course.courseId}')">
                        <span class="badge bg-success">
                            <i class="bi bi-person-badge me-1"></i>
                            <span id="lecturerCount_${course.courseId}">0</span>
                        </span>
                    </button>
                </td>
                <td class="action-buttons">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info" onclick="courseManager.viewCourseStudents('${course.courseId}')" title="View Students">
                            <i class="bi bi-people"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="courseManager.viewCourseLecturers('${course.courseId}')" title="View Lecturers">
                            <i class="bi bi-person-badge"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="courseManager.editCourse('${course.courseId}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="courseManager.confirmDelete('${course.courseId}', '${this.escapeHtml(course.courseName)}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Load student counts for each course
        coursesToRender.forEach(course => {
            this.loadCourseStudentCount(course.courseId);
        });
    }

    async loadCourseStudentCount(courseId) {
        try {
            const response = await fetch(`/api/courses/${courseId}/students`);
            if (response.ok) {
                const students = await response.json();
                const countElement = document.getElementById(`studentCount_${courseId}`);
                if (countElement) {
                    countElement.textContent = students.length;
                }
            }
        } catch (error) {
            console.error(`Error loading student count for ${courseId}:`, error);
            const countElement = document.getElementById(`studentCount_${courseId}`);
            if (countElement) {
                countElement.textContent = '0';
            }
        }
    }

    async updateStatistics() {
        const totalCourses = this.courses.length;
        document.getElementById('totalCourses').textContent = totalCourses;

        // Count unique departments
        const uniqueDepartments = new Set(this.courses.map(course => course.department?.departmentId).filter(Boolean));
        document.getElementById('totalDepartments').textContent = uniqueDepartments.size;

        // Calculate total enrollments
        try {
            const enrollmentCounts = await Promise.all(this.courses.map(async course => {
                try {
                    const response = await fetch(`/api/courses/${course.courseId}/students`);
                    if (response.ok) {
                        const students = await response.json();
                        return students.length;
                    }
                } catch (error) {
                    return 0;
                }
                return 0;
            }));

            const totalEnrollments = enrollmentCounts.reduce((sum, count) => sum + count, 0);
            document.getElementById('totalEnrollments').textContent = totalEnrollments;
            document.getElementById('avgStudentsPerCourse').textContent =
                totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0;
        } catch (error) {
            console.error('Error calculating course statistics:', error);
        }
    }

    filterCourses(searchTerm) {
        const filtered = this.courses.filter(course =>
            course.courseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.department?.name && course.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderCourses(filtered);
    }

    filterByDepartment(departmentId) {
        if (!departmentId) {
            this.renderCourses(this.courses);
            return;
        }

        const filtered = this.courses.filter(course =>
            course.department?.departmentId === departmentId
        );
        this.renderCourses(filtered);
    }

    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Course';
        document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i>Save Course';
        document.getElementById('courseId').disabled = false;
        document.getElementById('courseForm').reset();
    }

    async editCourse(courseId) {
        const course = this.courses.find(c => c.courseId === courseId);
        if (!course) return;

        this.currentEditId = courseId;
        document.getElementById('modalTitle').textContent = 'Edit Course';
        document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i>Update Course';

        // Disable ID field during edit
        document.getElementById('courseId').disabled = true;
        document.getElementById('courseId').value = course.courseId;
        document.getElementById('courseName').value = course.courseName;
        document.getElementById('courseDepartment').value = course.department?.departmentId || '';

        // Show modal
        new bootstrap.Modal(document.getElementById('courseModal')).show();
    }

    async saveCourse() {
        const form = document.getElementById('courseForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const selectedDepartment = this.departments.find(d => d.departmentId === document.getElementById('courseDepartment').value);

        const courseData = {
            courseId: document.getElementById('courseId').value.trim(),
            courseName: document.getElementById('courseName').value.trim(),
            department: selectedDepartment
        };

        try {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';

            let response;
            if (this.currentEditId) {
                // Update existing course
                response = await fetch(`/api/courses/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(courseData)
                });
            } else {
                // Create new course
                response = await fetch('/api/courses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(courseData)
                });
            }

            if (response.ok) {
                this.showSuccess(this.currentEditId ? 'Course updated successfully!' : 'Course created successfully!');
                bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
                this.loadCourses();
            } else {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to save course');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showError('Failed to save course: ' + error.message);
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = this.currentEditId ?
                '<i class="bi bi-check-circle me-1"></i>Update Course' :
                '<i class="bi bi-check-circle me-1"></i>Save Course';
        }
    }

    confirmDelete(courseId, courseName) {
        document.getElementById('deleteCourseName').textContent = courseName;
        document.getElementById('confirmDeleteBtn').onclick = () => this.deleteCourse(courseId);
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
    }

    async deleteCourse(courseId) {
        try {
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Deleting...';

            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Course deleted successfully!');
                bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
                this.loadCourses();
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showError('Failed to delete course: ' + error.message);
        } finally {
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-trash me-1"></i>Delete Course';
        }
    }

    async viewCourseStudents(courseId) {
        try {
            const course = this.courses.find(c => c.courseId === courseId);
            this.currentCourseId = courseId;
            document.getElementById('studentModalCourseName').textContent = course ? course.courseName : courseId;

            const response = await fetch(`/api/courses/${courseId}/students`);
            if (!response.ok) {
                throw new Error('Failed to load students');
            }

            const students = await response.json();
            const container = document.getElementById('studentsTableContainer');

            if (students.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                        <h5 class="mt-3 text-muted">No Students Enrolled</h5>
                        <p class="text-muted">This course doesn't have any enrolled students yet.</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${students.map(student => `
                                    <tr>
                                        <td><strong class="text-primary">${this.escapeHtml(student.studentId || 'N/A')}</strong></td>
                                        <td>${this.escapeHtml((student.firstName || '') + ' ' + (student.lastName || '')).trim() || 'N/A'}</td>
                                        <td>${this.escapeHtml(student.email || 'N/A')}</td>
                                        <td>${student.department ? this.escapeHtml(student.department.name) : 'N/A'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-danger" onclick="courseManager.dropStudent('${courseId}', '${student.studentId}')" title="Drop Student">
                                                <i class="bi bi-person-dash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }

            new bootstrap.Modal(document.getElementById('studentsModal')).show();
        } catch (error) {
            console.error('Error loading students:', error);
            this.showError('Failed to load students for this course.');
        }
    }

    async viewCourseLecturers(courseId) {
        try {
            const course = this.courses.find(c => c.courseId === courseId);
            document.getElementById('lecturerModalCourseName').textContent = course ? course.courseName : courseId;

            const container = document.getElementById('lecturersTableContainer');
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-person-badge text-muted" style="font-size: 3rem;"></i>
                    <h5 class="mt-3 text-muted">Lecturer Management</h5>
                    <p class="text-muted">Lecturer assignment feature coming soon.</p>
                </div>
            `;

            new bootstrap.Modal(document.getElementById('lecturersModal')).show();
        } catch (error) {
            console.error('Error loading lecturers:', error);
            this.showError('Failed to load lecturers for this course.');
        }
    }

    showEnrollmentModal() {
        new bootstrap.Modal(document.getElementById('enrollmentModal')).show();
    }

    async enrollStudent() {
        const studentId = document.getElementById('studentSelect').value;
        if (!studentId || !this.currentCourseId) {
            this.showError('Please select a student');
            return;
        }

        try {
            const response = await fetch(`/api/courses/${this.currentCourseId}/enroll/${studentId}`, {
                method: 'POST'
            });

            if (response.ok) {
                this.showSuccess('Student enrolled successfully!');
                bootstrap.Modal.getInstance(document.getElementById('enrollmentModal')).hide();
                // Refresh the students view
                this.viewCourseStudents(this.currentCourseId);
                this.updateStatistics();
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to enroll student');
            }
        } catch (error) {
            console.error('Error enrolling student:', error);
            this.showError('Failed to enroll student: ' + error.message);
        }
    }

    async dropStudent(courseId, studentId) {
        if (!confirm('Are you sure you want to drop this student from the course?')) {
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseId}/drop/${studentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Student dropped successfully!');
                // Refresh the students view
                this.viewCourseStudents(courseId);
                this.updateStatistics();
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to drop student');
            }
        } catch (error) {
            console.error('Error dropping student:', error);
            this.showError('Failed to drop student: ' + error.message);
        }
    }

    refreshData() {
        this.loadCourses();
        this.loadDepartments();
        this.loadStudents();
        this.showSuccess('Data refreshed successfully!');
    }

    exportData() {
        if (this.courses.length === 0) {
            this.showError('No data to export');
            return;
        }

        const csvContent = this.convertToCSV(this.courses);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `courses_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showSuccess('Data exported successfully!');
    }

    convertToCSV(data) {
        const headers = ['Course ID', 'Course Name', 'Department'];
        const rows = data.map(course => [
            course.courseId,
            course.courseName,
            course.department ? course.department.name : ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    showLoading(show) {
        document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert-dismissible');
        existingAlerts.forEach(alert => alert.remove());

        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const container = document.querySelector('.container');
        container.insertAdjacentHTML('afterbegin', alertHtml);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.querySelector('.alert-dismissible');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
let courseManager;

function openAddModal() {
    courseManager.openAddModal();
}

function saveCourse() {
    courseManager.saveCourse();
}

function refreshData() {
    courseManager.refreshData();
}

function exportData() {
    courseManager.exportData();
}

function showEnrollmentModal() {
    courseManager.showEnrollmentModal();
}

function enrollStudent() {
    courseManager.enrollStudent();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    courseManager = new CourseManager();
});
