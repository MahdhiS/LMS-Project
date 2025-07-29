// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.baseURL = '/api';
        this.currentEditId = null;
        this.currentEditType = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.showSection('dashboard');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                this.updateActiveNav(link);
            });
        });

        // Change password button
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
            modal.show();
        });
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');

        // Load data for the section
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'admins':
                this.loadAdmins();
                break;
            case 'lecturers':
                this.loadLecturers();
                break;
            case 'students':
                this.loadStudents();
                break;
            case 'departments':
                this.loadDepartments();
                break;
            case 'courses':
                this.loadCourses();
                break;
            case 'enrollments':
                this.loadEnrollments();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const [students, courses, departments] = await Promise.all([
                this.fetchJSON('/students'),
                this.fetchJSON('/courses'),
                this.fetchJSON('/departments')
            ]);

            document.getElementById('totalAdmins').textContent = '1';
            document.getElementById('totalLecturers').textContent = '0';
            document.getElementById('totalStudents').textContent = Array.isArray(students) ? students.length : 0;
            document.getElementById('totalCourses').textContent = Array.isArray(courses) ? courses.length : 0;
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showAlert('Error loading dashboard data', 'danger');
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        return data;
    }

    async fetchJSON(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async postData(endpoint, data) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response;
    }

    async putData(endpoint, data) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response;
    }

    async deleteData(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE'
        });
        return response;
    }

    // Admin Management
    async loadAdmins() {
        try {
            const data = await this.fetchData('/admin/getAllAdmins');
            this.renderAdminsTable(this.parseAdminData(data));
        } catch (error) {
            console.error('Error loading admins:', error);
            this.showAlert('Error loading admins', 'danger');
        }
    }

    parseAdminData(dataString) {
        try {
            if (typeof dataString === 'string' && dataString.startsWith('[')) {
                return JSON.parse(dataString);
            }
            return [];
        } catch (error) {
            console.error('Error parsing admin data:', error);
            return [];
        }
    }

    renderAdminsTable(admins) {
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = '';

        admins.forEach(admin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${admin.userId || ''}</td>
                <td>${admin.username || ''}</td>
                <td>${admin.firstName || ''}</td>
                <td>${admin.lastName || ''}</td>
                <td>${admin.email || ''}</td>
                <td>${admin.phone || ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="dashboard.editAdmin('${admin.username}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="dashboard.deleteAdmin('${admin.username}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Lecturer Management
    async loadLecturers() {
        try {
            const data = await this.fetchData('/admin/getAllLecturers');
            this.renderLecturersTable(this.parseLecturerData(data));
            await this.loadDepartmentOptions('lecturerDepartment');
        } catch (error) {
            console.error('Error loading lecturers:', error);
            this.showAlert('Error loading lecturers', 'danger');
        }
    }

    parseLecturerData(dataString) {
        try {
            if (typeof dataString === 'string' && dataString.startsWith('[')) {
                return JSON.parse(dataString);
            }
            return [];
        } catch (error) {
            console.error('Error parsing lecturer data:', error);
            return [];
        }
    }

    renderLecturersTable(lecturers) {
        const tbody = document.getElementById('lecturersTableBody');
        tbody.innerHTML = '';

        lecturers.forEach(lecturer => {
            const row = document.createElement('tr');
            const departmentName = lecturer.department ? lecturer.department.name : 'Not Assigned';
            const licStatus = lecturer.lic ? 'LIC' : 'Non-LIC';
            const licBadgeClass = lecturer.lic ? 'badge-lic' : 'badge-non-lic';

            row.innerHTML = `
                <td>${lecturer.userId || ''}</td>
                <td>${lecturer.username || ''}</td>
                <td>${lecturer.firstName || ''}</td>
                <td>${lecturer.lastName || ''}</td>
                <td>${lecturer.email || ''}</td>
                <td>${departmentName}</td>
                <td><span class="badge ${licBadgeClass}">${licStatus}</span></td>
                <td>
                    <div class="action-buttons">
                        ${!lecturer.lic ? 
                            `<button class="btn btn-success btn-sm" onclick="dashboard.makeLIC('${lecturer.userId}')">
                                <i class="bi bi-arrow-up"></i> Make LIC
                            </button>` : 
                            `<button class="btn btn-info btn-sm" onclick="dashboard.removeLIC('${lecturer.userId}')">
                                <i class="bi bi-arrow-down"></i> Remove LIC
                            </button>`
                        }
                        <button class="btn btn-danger btn-sm" onclick="dashboard.deleteLecturer('${lecturer.userId}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Student Management
    async loadStudents() {
        try {
            const students = await this.fetchJSON('/students');
            this.renderStudentsTable(students);
            await this.loadDepartmentOptions('studentDepartment');
        } catch (error) {
            console.error('Error loading students:', error);
            this.showAlert('Error loading students', 'danger');
        }
    }

    renderStudentsTable(students) {
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = '';

        if (!Array.isArray(students) || students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No students found</td></tr>';
            return;
        }

        students.forEach(student => {
            const row = document.createElement('tr');
            const departmentName = student.department ? student.department.name : 'Not Assigned';

            row.innerHTML = `
                <td>${student.userId || ''}</td>
                <td>${student.username || ''}</td>
                <td>${student.firstName || ''}</td>
                <td>${student.lastName || ''}</td>
                <td>${student.email || ''}</td>
                <td>${departmentName}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="dashboard.editStudent('${student.userId}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="dashboard.deleteStudent('${student.userId}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Department Management
    async loadDepartments() {
        try {
            const departments = await this.fetchJSON('/departments');
            this.renderDepartmentsTable(departments);
        } catch (error) {
            console.error('Error loading departments:', error);
            this.showAlert('Error loading departments', 'danger');
        }
    }

    renderDepartmentsTable(departments) {
        const tbody = document.getElementById('departmentsTableBody');
        tbody.innerHTML = '';

        departments.forEach(department => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${department.departmentId}</td>
                <td>${department.name}</td>
                <td>${department.description || ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="dashboard.editDepartment('${department.departmentId}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="dashboard.deleteDepartment('${department.departmentId}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Course Management
    async loadCourses() {
        try {
            const courses = await this.fetchJSON('/courses');
            this.renderCoursesTable(courses);
            await this.loadDepartmentOptions('courseDepartment');
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showAlert('Error loading courses', 'danger');
        }
    }

    renderCoursesTable(courses) {
        const tbody = document.getElementById('coursesTableBody');
        tbody.innerHTML = '';

        if (!Array.isArray(courses) || courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No courses found</td></tr>';
            return;
        }

        courses.forEach(course => {
            const row = document.createElement('tr');
            const departmentName = course.department ? course.department.name : 'Not Assigned';

            row.innerHTML = `
                <td>${course.courseId}</td>
                <td>${course.courseName}</td>
                <td>${departmentName}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="dashboard.editCourse('${course.courseId}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="dashboard.deleteCourse('${course.courseId}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Enrollment Management
    async loadEnrollments() {
        try {
            const [students, courses] = await Promise.all([
                this.fetchJSON('/students'),
                this.fetchJSON('/courses')
            ]);

            const enrollmentPromises = students.map(student =>
                this.fetchJSON(`/students/${student.userId}/courses`)
                    .then(studentCourses =>
                        studentCourses.map(course => ({
                            enrollmentId: `${student.userId}-${course.courseId}`,
                            student: student,
                            course: course,
                            enrollmentDate: new Date().toISOString().split('T')[0],
                            status: 'ACTIVE'
                        }))
                    )
                    .catch(() => [])
            );

            const enrollmentArrays = await Promise.all(enrollmentPromises);
            const enrollments = enrollmentArrays.flat();

            this.renderEnrollmentsTable(enrollments);
            await this.loadStudentOptions('enrollmentStudent');
            await this.loadCourseOptions('enrollmentCourse');
        } catch (error) {
            console.error('Error loading enrollments:', error);
            this.showAlert('Error loading enrollments', 'danger');
        }
    }

    renderEnrollmentsTable(enrollments) {
        const tbody = document.getElementById('enrollmentsTableBody');
        tbody.innerHTML = '';

        if (!Array.isArray(enrollments) || enrollments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No enrollments found</td></tr>';
            return;
        }

        enrollments.forEach(enrollment => {
            const row = document.createElement('tr');
            const enrollmentDate = enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A';
            const statusBadgeClass = this.getStatusBadgeClass(enrollment.status);

            row.innerHTML = `
                <td>${enrollment.course ? enrollment.course.courseId : 'N/A'}</td>
                <td>${enrollment.student ? enrollment.student.userId : 'N/A'}</td>
                <td>${enrollmentDate}</td>
                <td><span class="badge ${statusBadgeClass}">${enrollment.status || 'ACTIVE'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm" onclick="dashboard.viewEnrollmentDetails('${enrollment.student.userId}', '${enrollment.course.courseId}')">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="dashboard.deleteEnrollment('${enrollment.student.userId}', '${enrollment.course.courseId}')">
                            <i class="bi bi-trash"></i> Remove
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getStatusBadgeClass(status) {
        switch(status?.toUpperCase()) {
            case 'ACTIVE': return 'bg-success';
            case 'INACTIVE': return 'bg-secondary';
            case 'COMPLETED': return 'bg-primary';
            case 'DROPPED': return 'bg-danger';
            default: return 'bg-success';
        }
    }

    async loadDepartmentOptions(selectId) {
        try {
            const departments = await this.fetchJSON('/departments');
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Department</option>';

            departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department.departmentId;
                option.textContent = department.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading department options:', error);
        }
    }

    async loadStudentOptions(selectId) {
        try {
            const students = await this.fetchJSON('/students');
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Student</option>';

            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.userId;
                option.textContent = `${student.firstName} ${student.lastName} (${student.userId})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading student options:', error);
        }
    }

    async loadCourseOptions(selectId) {
        try {
            const courses = await this.fetchJSON('/courses');
            const select = document.getElementById(selectId);
            select.innerHTML = '<option value="">Select Course</option>';

            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.courseId;
                option.textContent = `${course.courseName} (${course.courseId})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading course options:', error);
        }
    }

    // Modal Functions
    openAdminModal(adminData = null) {
        const modal = document.getElementById('adminModal');
        const title = document.getElementById('adminModalTitle');

        if (adminData) {
            title.textContent = 'Edit Admin';
            this.populateAdminForm(adminData);
            this.currentEditId = adminData.username;
            this.currentEditType = 'admin';
        } else {
            title.textContent = 'Add Admin';
            this.clearAdminForm();
            this.currentEditId = null;
            this.currentEditType = null;
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    openLecturerModal(lecturerData = null) {
        const modal = document.getElementById('lecturerModal');

        if (lecturerData) {
            this.populateLecturerForm(lecturerData);
            this.currentEditId = lecturerData.userId;
            this.currentEditType = 'lecturer';
        } else {
            this.clearLecturerForm();
            this.currentEditId = null;
            this.currentEditType = null;
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    openDepartmentModal(departmentData = null) {
        const modal = document.getElementById('departmentModal');
        const title = document.getElementById('departmentModalTitle');

        if (departmentData) {
            title.textContent = 'Edit Department';
            this.populateDepartmentForm(departmentData);
            this.currentEditId = departmentData.departmentId;
            this.currentEditType = 'department';
        } else {
            title.textContent = 'Add Department';
            this.clearDepartmentForm();
            this.currentEditId = null;
            this.currentEditType = null;
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    openCourseModal(courseData = null) {
        const modal = document.getElementById('courseModal');
        const title = document.getElementById('courseModalTitle');

        if (courseData) {
            title.textContent = 'Edit Course';
            this.populateCourseForm(courseData);
            this.currentEditId = courseData.courseId;
            this.currentEditType = 'course';
        } else {
            title.textContent = 'Add Course';
            this.clearCourseForm();
            this.currentEditId = null;
            this.currentEditType = null;
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    openStudentModal(studentData = null) {
        const modal = document.getElementById('studentModal');
        const title = document.getElementById('studentModalTitle');

        if (studentData) {
            title.textContent = 'Edit Student';
            this.populateStudentForm(studentData);
            this.currentEditId = studentData.userId;
            this.currentEditType = 'student';
        } else {
            title.textContent = 'Add Student';
            this.clearStudentForm();
            this.currentEditId = null;
            this.currentEditType = null;
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    openEnrollmentModal(enrollmentData = null) {
        const modal = document.getElementById('enrollmentModal');
        const title = document.getElementById('enrollmentModalTitle');

        title.textContent = 'Add New Enrollment';
        this.clearEnrollmentForm();
        this.currentEditId = null;
        this.currentEditType = null;

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    // Form population and clearing
    populateAdminForm(admin) {
        document.getElementById('adminUserId').value = admin.userId || '';
        document.getElementById('adminUsername').value = admin.username || '';
        document.getElementById('adminFirstName').value = admin.firstName || '';
        document.getElementById('adminLastName').value = admin.lastName || '';
        document.getElementById('adminEmail').value = admin.email || '';
        document.getElementById('adminPhone').value = admin.phone || '';
        document.getElementById('adminPassword').value = '';
    }

    clearAdminForm() {
        document.getElementById('adminForm').reset();
    }

    populateLecturerForm(lecturer) {
        document.getElementById('lecturerUserId').value = lecturer.userId || '';
        document.getElementById('lecturerUsername').value = lecturer.username || '';
        document.getElementById('lecturerFirstName').value = lecturer.firstName || '';
        document.getElementById('lecturerLastName').value = lecturer.lastName || '';
        document.getElementById('lecturerEmail').value = lecturer.email || '';
        document.getElementById('lecturerPhone').value = lecturer.phone || '';
        if (lecturer.department) {
            document.getElementById('lecturerDepartment').value = lecturer.department.departmentId;
        }
        document.getElementById('lecturerPassword').value = '';
    }

    clearLecturerForm() {
        document.getElementById('lecturerForm').reset();
    }

    populateDepartmentForm(department) {
        document.getElementById('departmentName').value = department.name || '';
        document.getElementById('departmentDescription').value = department.description || '';
    }

    clearDepartmentForm() {
        document.getElementById('departmentForm').reset();
    }

    populateCourseForm(course) {
        document.getElementById('courseName').value = course.courseName || '';
        if (course.department) {
            document.getElementById('courseDepartment').value = course.department.departmentId;
        }
    }

    clearCourseForm() {
        document.getElementById('courseForm').reset();
    }

    populateStudentForm(student) {
        document.getElementById('studentUserId').value = student.userId || '';
        document.getElementById('studentUsername').value = student.username || '';
        document.getElementById('studentFirstName').value = student.firstName || '';
        document.getElementById('studentLastName').value = student.lastName || '';
        document.getElementById('studentEmail').value = student.email || '';
        document.getElementById('studentPhone').value = student.phone || '';
        if (student.department) {
            document.getElementById('studentDepartment').value = student.department.departmentId;
        }
        document.getElementById('studentPassword').value = '';
    }

    clearStudentForm() {
        document.getElementById('studentForm').reset();
    }

    clearEnrollmentForm() {
        document.getElementById('enrollmentForm').reset();
    }

    // Save Functions
    async saveAdmin() {
        const adminData = {
            userId: document.getElementById('adminUserId').value,
            username: document.getElementById('adminUsername').value,
            password: document.getElementById('adminPassword').value,
            firstName: document.getElementById('adminFirstName').value,
            lastName: document.getElementById('adminLastName').value,
            email: document.getElementById('adminEmail').value,
            phone: document.getElementById('adminPhone').value,
            adminStatus: true
        };

        try {
            let response;
            if (this.currentEditId) {
                response = await this.putData(`/admin/update/${this.currentEditId}`, adminData);
            } else {
                response = await this.postData('/admin/newAdmin', adminData);
            }

            if (response.ok) {
                this.showAlert('Admin saved successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide();
                this.loadAdmins();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            this.showAlert('Error saving admin', 'danger');
        }
    }

    async saveLecturer() {
        const lecturerData = {
            userId: document.getElementById('lecturerUserId').value,
            username: document.getElementById('lecturerUsername').value,
            password: document.getElementById('lecturerPassword').value,
            firstName: document.getElementById('lecturerFirstName').value,
            lastName: document.getElementById('lecturerLastName').value,
            email: document.getElementById('lecturerEmail').value,
            phone: document.getElementById('lecturerPhone').value
        };

        try {
            const response = await this.postData('/admin/newLecturer', lecturerData);

            if (response.ok) {
                this.showAlert('Lecturer saved successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('lecturerModal')).hide();
                this.loadLecturers();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error saving lecturer:', error);
            this.showAlert('Error saving lecturer', 'danger');
        }
    }

    async saveDepartment() {
        const departmentData = {
            name: document.getElementById('departmentName').value,
            description: document.getElementById('departmentDescription').value
        };

        try {
            let response;
            if (this.currentEditId) {
                response = await this.putData(`/departments/${this.currentEditId}`, departmentData);
            } else {
                response = await this.postData('/departments', departmentData);
            }

            if (response.ok) {
                this.showAlert('Department saved successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('departmentModal')).hide();
                this.loadDepartments();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error saving department:', error);
            this.showAlert('Error saving department', 'danger');
        }
    }

    async saveCourse() {
        const courseData = {
            courseName: document.getElementById('courseName').value,
            department: {
                departmentId: document.getElementById('courseDepartment').value
            }
        };

        try {
            let response;
            if (this.currentEditId) {
                response = await this.putData(`/courses/${this.currentEditId}`, courseData);
            } else {
                response = await this.postData('/courses', courseData);
            }

            if (response.ok) {
                this.showAlert('Course saved successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
                this.loadCourses();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showAlert('Error saving course', 'danger');
        }
    }

    async saveStudent() {
        const studentData = {
            userId: document.getElementById('studentUserId').value,
            username: document.getElementById('studentUsername').value,
            password: document.getElementById('studentPassword').value,
            firstName: document.getElementById('studentFirstName').value,
            lastName: document.getElementById('studentLastName').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            department: {
                departmentId: document.getElementById('studentDepartment').value
            }
        };

        try {
            let response;
            if (this.currentEditId) {
                response = await this.putData(`/students/${this.currentEditId}`, studentData);
            } else {
                response = await this.postData('/students', studentData);
            }

            if (response.ok) {
                this.showAlert('Student saved successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
                this.loadStudents();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error saving student:', error);
            this.showAlert('Error saving student', 'danger');
        }
    }

    async saveEnrollment() {
        const studentId = document.getElementById('enrollmentStudent').value;
        const courseId = document.getElementById('enrollmentCourse').value;

        if (!studentId || !courseId) {
            this.showAlert('Please select both student and course', 'warning');
            return;
        }

        try {
            const response = await this.postData(`/students/${studentId}/enroll/${courseId}`, {});

            if (response.ok) {
                this.showAlert('Student enrolled successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('enrollmentModal')).hide();
                this.loadEnrollments();
            } else {
                const error = await response.text();
                this.showAlert(`Enrollment failed: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error saving enrollment:', error);
            this.showAlert('Error enrolling student', 'danger');
        }
    }

    // Edit Functions
    async editAdmin(username) {
        try {
            const adminData = await this.fetchJSON(`/admin/get/${username}`);
            this.openAdminModal(adminData);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            this.showAlert('Error loading admin data', 'danger');
        }
    }

    async editStudent(userId) {
        try {
            const studentData = await this.fetchJSON(`/students/${userId}`);
            this.openStudentModal(studentData);
        } catch (error) {
            console.error('Error fetching student data:', error);
            this.showAlert('Error loading student data', 'danger');
        }
    }

    async editDepartment(id) {
        try {
            const departmentData = await this.fetchJSON(`/departments/${id}`);
            this.openDepartmentModal(departmentData);
        } catch (error) {
            console.error('Error fetching department data:', error);
            this.showAlert('Error loading department data', 'danger');
        }
    }

    async editCourse(id) {
        try {
            const courseData = await this.fetchJSON(`/courses/${id}`);
            this.openCourseModal(courseData);
        } catch (error) {
            console.error('Error fetching course data:', error);
            this.showAlert('Error loading course data', 'danger');
        }
    }

    // Delete Functions
    async deleteAdmin(username) {
        if (confirm('Are you sure you want to delete this admin?')) {
            try {
                const response = await this.deleteData(`/admin/deleteAdmin/${username}`);
                if (response.ok) {
                    this.showAlert('Admin deleted successfully', 'success');
                    this.loadAdmins();
                } else {
                    const error = await response.text();
                    this.showAlert(`Error: ${error}`, 'danger');
                }
            } catch (error) {
                console.error('Error deleting admin:', error);
                this.showAlert('Error deleting admin', 'danger');
            }
        }
    }

    async deleteStudent(userId) {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                const response = await this.deleteData(`/students/delete/${userId}`);
                if (response.ok) {
                    this.showAlert('Student deleted successfully', 'success');
                    this.loadStudents();
                } else {
                    const error = await response.text();
                    this.showAlert(`Error: ${error}`, 'danger');
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                this.showAlert('Error deleting student', 'danger');
            }
        }
    }

    async deleteLecturer(userId) {
        if (confirm('Are you sure you want to delete this lecturer?')) {
            try {
                const response = await this.deleteData(`/admin/deleteLecturer/${userId}`);
                if (response.ok) {
                    this.showAlert('Lecturer deleted successfully', 'success');
                    this.loadLecturers();
                } else {
                    const error = await response.text();
                    this.showAlert(`Error: ${error}`, 'danger');
                }
            } catch (error) {
                console.error('Error deleting lecturer:', error);
                this.showAlert('Error deleting lecturer', 'danger');
            }
        }
    }

    async deleteDepartment(id) {
        if (confirm('Are you sure you want to delete this department?')) {
            try {
                const response = await this.deleteData(`/departments/delete/${id}`);
                if (response.ok) {
                    this.showAlert('Department deleted successfully', 'success');
                    this.loadDepartments();
                } else {
                    const error = await response.text();
                    this.showAlert(`Error: ${error}`, 'danger');
                }
            } catch (error) {
                console.error('Error deleting department:', error);
                this.showAlert('Error deleting department', 'danger');
            }
        }
    }

    async deleteCourse(id) {
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                const response = await this.deleteData(`/courses/${id}`);
                if (response.ok) {
                    this.showAlert('Course deleted successfully', 'success');
                    this.loadCourses();
                } else {
                    const error = await response.text();
                    this.showAlert(`Error: ${error}`, 'danger');
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                this.showAlert('Error deleting course', 'danger');
            }
        }
    }

    async deleteEnrollment(studentId, courseId) {
        if (confirm('Are you sure you want to drop this student from the course?')) {
            try {
                const response = await this.deleteData(`/students/${studentId}/drop/${courseId}`);
                if (response.ok) {
                    this.showAlert('Student dropped from course successfully', 'success');
                    this.loadEnrollments();
                } else {
                    const error = await response.text();
                    this.showAlert(`Drop failed: ${error}`, 'danger');
                }
            } catch (error) {
                console.error('Error dropping student:', error);
                this.showAlert('Error dropping student from course', 'danger');
            }
        }
    }

    async viewEnrollmentDetails(studentId, courseId) {
        try {
            const [student, course] = await Promise.all([
                this.fetchJSON(`/students/${studentId}`),
                this.fetchJSON(`/courses/${courseId}`)
            ]);

            const message = `Enrollment Details:
        
Student: ${student.firstName} ${student.lastName} (${student.userId})
Course: ${course.courseName} (${course.courseId})
Department: ${course.department ? course.department.name : 'N/A'}
Status: ACTIVE`;

            alert(message);
        } catch (error) {
            console.error('Error fetching enrollment details:', error);
            this.showAlert('Error loading enrollment details', 'danger');
        }
    }

    // Lecturer LIC Functions
    async makeLIC(lecturerId) {
        try {
            const response = await fetch(`${this.baseURL}/admin/makeLic/${lecturerId}`, {method: 'PUT'});
            if (response.ok) {
                this.showAlert('Lecturer promoted to LIC successfully', 'success');
                this.loadLecturers();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error making lecturer LIC:', error);
            this.showAlert('Error promoting lecturer', 'danger');
        }
    }

    async removeLIC(lecturerId) {
        try {
            const response = await fetch(`${this.baseURL}/admin/removeLic/${lecturerId}`, {method: 'PUT'});
            if (response.ok) {
                this.showAlert('LIC status removed successfully', 'success');
                this.loadLecturers();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error removing LIC status:', error);
            this.showAlert('Error removing LIC status', 'danger');
        }
    }

    // Change Password Function
    async changePassword() {
        const username = document.getElementById('currentUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.showAlert('Passwords do not match', 'danger');
            return;
        }

        const passwordChangeData = {
            userName: username,
            newPassword: newPassword
        };

        try {
            const response = await this.putData('/admin/changePassword', passwordChangeData);
            if (response.ok) {
                this.showAlert('Password changed successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
                document.getElementById('changePasswordForm').reset();
            } else {
                const error = await response.text();
                this.showAlert(`Error: ${error}`, 'danger');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showAlert('Error changing password', 'danger');
        }
    }

    // Utility Functions
    showAlert(message, type) {
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const mainContent = document.querySelector('main');
        mainContent.insertBefore(alertDiv, mainContent.firstChild);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Global functions for onclick handlers
function openAdminModal() {
    dashboard.openAdminModal();
}

function openLecturerModal() {
    dashboard.openLecturerModal();
}

function openDepartmentModal() {
    dashboard.openDepartmentModal();
}

function openCourseModal() {
    dashboard.openCourseModal();
}

function openStudentModal() {
    dashboard.openStudentModal();
}

function openEnrollmentModal() {
    dashboard.openEnrollmentModal();
}

function saveAdmin() {
    dashboard.saveAdmin();
}

function saveLecturer() {
    dashboard.saveLecturer();
}

function saveDepartment() {
    dashboard.saveDepartment();
}

function saveCourse() {
    dashboard.saveCourse();
}

function saveStudent() {
    dashboard.saveStudent();
}

function saveEnrollment() {
    dashboard.saveEnrollment();
}

function changePassword() {
    dashboard.changePassword();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new AdminDashboard();
});
