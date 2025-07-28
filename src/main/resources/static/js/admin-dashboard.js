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
        }
    }

    async loadDashboardData() {
        try {
            const [admins, lecturers, students, courses] = await Promise.all([
                this.fetchData('/admin/getAllAdmins'),
                this.fetchData('/admin/getAllLecturers'),
                this.fetchData('/admin/getAllStudents'),
                this.fetchData('/admin/getAllCourses')
            ]);

            // Update dashboard statistics
            document.getElementById('totalAdmins').textContent = this.parseCount(admins);
            document.getElementById('totalLecturers').textContent = this.parseCount(lecturers);
            document.getElementById('totalStudents').textContent = this.parseCount(students);
            document.getElementById('totalCourses').textContent = this.parseCount(courses);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showAlert('Error loading dashboard data', 'danger');
        }
    }

    parseCount(dataString) {
        try {
            if (typeof dataString === 'string') {
                // Handle array string format
                if (dataString.startsWith('[') && dataString.endsWith(']')) {
                    const parsed = JSON.parse(dataString);
                    return Array.isArray(parsed) ? parsed.length : 0;
                }
                // Handle other string formats
                return dataString.split(',').filter(item => item.trim()).length;
            }
            return Array.isArray(dataString) ? dataString.length : 0;
        } catch (error) {
            console.error('Error parsing count:', error);
            return 0;
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
            const data = await this.fetchData('/admin/getAllStudents');
            this.renderStudentsTable(this.parseStudentData(data));
        } catch (error) {
            console.error('Error loading students:', error);
            this.showAlert('Error loading students', 'danger');
        }
    }

    parseStudentData(dataString) {
        try {
            if (typeof dataString === 'string' && dataString.startsWith('[')) {
                return JSON.parse(dataString);
            }
            return [];
        } catch (error) {
            console.error('Error parsing student data:', error);
            return [];
        }
    }

    renderStudentsTable(students) {
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = '';

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
                        <button class="btn btn-info btn-sm" onclick="dashboard.viewStudent('${student.userId}')">
                            <i class="bi bi-eye"></i> View
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
            this.departments = departments; // Store for filtering
            this.renderDepartmentsTable(departments);
            this.updateDepartmentStatistics(departments);
            this.setupDepartmentSearch();
        } catch (error) {
            console.error('Error loading departments:', error);
            this.showAlert('Error loading departments', 'danger');
        }
    }

    renderDepartmentsTable(departments) {
        const tbody = document.getElementById('departmentsTableBody');
        tbody.innerHTML = '';

        if (departments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                        <p class="mt-2 text-muted">No departments found</p>
                    </td>
                </tr>
            `;
            return;
        }

        departments.forEach(department => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong class="text-primary">${this.escapeHtml(department.departmentId)}</strong></td>
                <td><div class="fw-medium">${this.escapeHtml(department.name)}</div></td>
                <td><div class="text-muted" style="max-width: 300px;">${department.description ? this.escapeHtml(department.description) : '<em>No description</em>'}</div></td>
                <td>
                    <button class="btn btn-link p-0 text-decoration-none" onclick="dashboard.viewDepartmentStudents('${department.departmentId}')">
                        <span class="badge bg-info">
                            <i class="bi bi-people me-1"></i>
                            <span id="studentCount_${department.departmentId}">Loading...</span>
                        </span>
                    </button>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info" onclick="dashboard.viewDepartmentStudents('${department.departmentId}')" title="View Students">
                            <i class="bi bi-people"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="dashboard.viewDepartmentCourses('${department.departmentId}')" title="View Courses">
                            <i class="bi bi-book"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="dashboard.viewDepartmentDetails('${department.departmentId}')" title="View All Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="dashboard.editDepartment('${department.departmentId}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="dashboard.confirmDeleteDepartment('${department.departmentId}', '${this.escapeHtml(department.name)}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);

            // Load student count for each department
            this.loadDepartmentStudentCount(department.departmentId);
        });
    }

    async loadDepartmentStudentCount(departmentId) {
        try {
            const response = await fetch(`${this.baseURL}/departments/${departmentId}/students`);
            if (response.ok) {
                const students = await response.json();
                const countElement = document.getElementById(`studentCount_${departmentId}`);
                if (countElement) {
                    countElement.textContent = students.length;
                }
            }
        } catch (error) {
            console.error(`Error loading student count for ${departmentId}:`, error);
            const countElement = document.getElementById(`studentCount_${departmentId}`);
            if (countElement) {
                countElement.textContent = '0';
            }
        }
    }

    async updateDepartmentStatistics(departments) {
        const totalDepartments = departments.length;
        document.getElementById('totalDepartmentCount').textContent = totalDepartments;

        // Calculate total students across all departments
        try {
            const studentCounts = await Promise.all(departments.map(async dept => {
                try {
                    const response = await fetch(`${this.baseURL}/departments/${dept.departmentId}/students`);
                    if (response.ok) {
                        const students = await response.json();
                        return students.length;
                    }
                } catch (error) {
                    return 0;
                }
                return 0;
            }));

            const totalStudents = studentCounts.reduce((sum, count) => sum + count, 0);
            document.getElementById('totalDepartmentStudents').textContent = totalStudents;
            document.getElementById('avgStudentsPerDept').textContent =
                totalDepartments > 0 ? Math.round(totalStudents / totalDepartments) : 0;
        } catch (error) {
            console.error('Error calculating department statistics:', error);
        }
    }

    setupDepartmentSearch() {
        const searchInput = document.getElementById('departmentSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterDepartments(e.target.value);
            });
        }
    }

    filterDepartments(searchTerm) {
        if (!this.departments) return;

        const filtered = this.departments.filter(dept =>
            dept.departmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderDepartmentsTable(filtered);
    }

    openDepartmentModal() {
        this.currentEditId = null;
        this.currentEditType = 'department';
        document.getElementById('departmentModalTitle').textContent = 'Add New Department';
        document.getElementById('departmentForm').reset();

        // Enable departmentId field for new departments
        const deptIdField = document.getElementById('departmentId');
        if (deptIdField) {
            deptIdField.disabled = false;
        }
    }

    async editDepartment(departmentId) {
        const department = this.departments?.find(d => d.departmentId === departmentId);
        if (!department) return;

        this.currentEditId = departmentId;
        this.currentEditType = 'department';
        document.getElementById('departmentModalTitle').textContent = 'Edit Department';

        // Fill form with current data
        document.getElementById('departmentName').value = department.name;
        document.getElementById('departmentDescription').value = department.description || '';

        // Disable departmentId field during edit if it exists
        const deptIdField = document.getElementById('departmentId');
        if (deptIdField) {
            deptIdField.value = department.departmentId;
            deptIdField.disabled = true;
        }

        // Show modal
        new bootstrap.Modal(document.getElementById('departmentModal')).show();
    }

    confirmDeleteDepartment(departmentId, departmentName) {
        if (confirm(`Are you sure you want to delete the department "${departmentName}"?\n\nThis action cannot be undone and will affect all associated students and courses.`)) {
            this.deleteDepartment(departmentId);
        }
    }

    async deleteDepartment(departmentId) {
        try {
            const response = await this.deleteData(`/departments/delete/${departmentId}`);
            if (response.ok) {
                this.showAlert('Department deleted successfully!', 'success');
                this.loadDepartments();
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to delete department');
            }
        } catch (error) {
            console.error('Error deleting department:', error);
            this.showAlert('Failed to delete department: ' + error.message, 'danger');
        }
    }

    async viewDepartmentStudents(departmentId) {
        try {
            const department = this.departments?.find(d => d.departmentId === departmentId);
            const response = await fetch(`${this.baseURL}/departments/${departmentId}/students`);

            if (!response.ok) {
                throw new Error('Failed to load students');
            }

            const students = await response.json();

            // Create a simple modal to show students
            const modalHtml = `
                <div class="modal fade" id="studentsViewModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-people me-2"></i>
                                    Students in ${department ? department.name : departmentId}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${students.length === 0 ? `
                                    <div class="text-center py-4">
                                        <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                                        <h5 class="mt-3 text-muted">No Students Found</h5>
                                        <p class="text-muted">This department doesn't have any students yet.</p>
                                    </div>
                                ` : `
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Student ID</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Contact</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${students.map(student => `
                                                    <tr>
                                                        <td><strong class="text-primary">${this.escapeHtml(student.studentId || 'N/A')}</strong></td>
                                                        <td>${this.escapeHtml((student.firstName || '') + ' ' + (student.lastName || '')).trim() || 'N/A'}</td>
                                                        <td>${this.escapeHtml(student.email || 'N/A')}</td>
                                                        <td>${this.escapeHtml(student.phone || 'N/A')}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('studentsViewModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add new modal to body
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show modal
            new bootstrap.Modal(document.getElementById('studentsViewModal')).show();

        } catch (error) {
            console.error('Error loading students:', error);
            this.showAlert('Failed to load students for this department.', 'danger');
        }
    }

    exportDepartments() {
        if (!this.departments || this.departments.length === 0) {
            this.showAlert('No data to export', 'warning');
            return;
        }

        const csvContent = this.convertDepartmentsToCSV(this.departments);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `departments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showAlert('Data exported successfully!', 'success');
    }

    async viewDepartmentCourses(departmentId) {
        try {
            const department = this.departments?.find(d => d.departmentId === departmentId);
            const response = await fetch(`${this.baseURL}/courses/department/${departmentId}`);

            if (!response.ok) {
                throw new Error('Failed to load courses');
            }

            const courses = await response.json();

            // Store reference to this for use in template
            const escapeHtml = this.escapeHtml.bind(this);

            // Create a modal to show department courses
            const modalHtml = `
                <div class="modal fade" id="departmentCoursesViewModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-book me-2"></i>
                                    Courses in ${department ? department.name : departmentId}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${courses.length === 0 ? `
                                    <div class="text-center py-4">
                                        <i class="bi bi-book text-muted" style="font-size: 3rem;"></i>
                                        <h5 class="mt-3 text-muted">No Courses Found</h5>
                                        <p class="text-muted">This department doesn't have any courses yet.</p>
                                    </div>
                                ` : `
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Course ID</th>
                                                    <th>Course Name</th>
                                                    <th>Students Enrolled</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${courses.map(course => `
                                                    <tr>
                                                        <td><strong class="text-primary">${escapeHtml(course.courseId)}</strong></td>
                                                        <td>${escapeHtml(course.courseName)}</td>
                                                        <td>
                                                            <span class="badge bg-info" id="enrolledCount_${course.courseId}">Loading...</span>
                                                        </td>
                                                        <td>
                                                            <button class="btn btn-sm btn-outline-info" onclick="dashboard.viewCourseStudents('${course.courseId}')">
                                                                <i class="bi bi-people me-1"></i>View Students
                                                            </button>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('departmentCoursesViewModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add new modal to body
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show modal
            new bootstrap.Modal(document.getElementById('departmentCoursesViewModal')).show();

            // Load enrollment counts for each course
            courses.forEach(course => {
                this.loadCourseEnrollmentCount(course.courseId, 'enrolledCount_');
            });

        } catch (error) {
            console.error('Error loading courses:', error);
            this.showAlert('Failed to load courses for this department.', 'danger');
        }
    }

    async viewDepartmentDetails(departmentId) {
        try {
            const department = this.departments?.find(d => d.departmentId === departmentId);

            // Load both students and courses in parallel
            const [studentsResponse, coursesResponse] = await Promise.all([
                fetch(`${this.baseURL}/departments/${departmentId}/students`),
                fetch(`${this.baseURL}/courses/department/${departmentId}`)
            ]);

            if (!studentsResponse.ok || !coursesResponse.ok) {
                throw new Error('Failed to load department details');
            }

            const students = await studentsResponse.json();
            const courses = await coursesResponse.json();

            // Create comprehensive modal
            const modalHtml = `
                <div class="modal fade" id="departmentDetailsModal" tabindex="-1">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-building me-2"></i>
                                    ${department ? department.name : departmentId} - Complete Overview
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <!-- Department Info -->
                                <div class="row mb-4">
                                    <div class="col-12">
                                        <div class="card">
                                            <div class="card-header">
                                                <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Department Information</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <strong>Department ID:</strong> ${this.escapeHtml(departmentId)}
                                                    </div>
                                                    <div class="col-md-6">
                                                        <strong>Department Name:</strong> ${department ? this.escapeHtml(department.name) : 'N/A'}
                                                    </div>
                                                </div>
                                                ${department && department.description ? `
                                                    <div class="row mt-2">
                                                        <div class="col-12">
                                                            <strong>Description:</strong> ${this.escapeHtml(department.description)}
                                                        </div>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Statistics -->
                                <div class="row mb-4">
                                    <div class="col-md-4">
                                        <div class="card text-center">
                                            <div class="card-body">
                                                <i class="bi bi-people text-info fs-1"></i>
                                                <h4 class="mt-2">${students.length}</h4>
                                                <p class="text-muted mb-0">Students</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card text-center">
                                            <div class="card-body">
                                                <i class="bi bi-book text-success fs-1"></i>
                                                <h4 class="mt-2">${courses.length}</h4>
                                                <p class="text-muted mb-0">Courses</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card text-center">
                                            <div class="card-body">
                                                <i class="bi bi-graph-up text-warning fs-1"></i>
                                                <h4 class="mt-2" id="totalEnrollments_${departmentId}">Loading...</h4>
                                                <p class="text-muted mb-0">Total Enrollments</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tabs for Students and Courses -->
                                <ul class="nav nav-tabs" id="departmentTabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="students-tab" data-bs-toggle="tab" data-bs-target="#students-pane" type="button" role="tab">
                                            <i class="bi bi-people me-1"></i>Students (${students.length})
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="courses-tab" data-bs-toggle="tab" data-bs-target="#courses-pane" type="button" role="tab">
                                            <i class="bi bi-book me-1"></i>Courses (${courses.length})
                                        </button>
                                    </li>
                                </ul>

                                <div class="tab-content mt-3" id="departmentTabContent">
                                    <!-- Students Tab -->
                                    <div class="tab-pane fade show active" id="students-pane" role="tabpanel">
                                        ${students.length === 0 ? `
                                            <div class="text-center py-4">
                                                <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                                                <h5 class="mt-3 text-muted">No Students Found</h5>
                                                <p class="text-muted">This department doesn't have any students yet.</p>
                                            </div>
                                        ` : `
                                            <div class="table-responsive">
                                                <table class="table table-hover">
                                                    <thead class="table-light">
                                                        <tr>
                                                            <th>Student ID</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Contact</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${students.map(student => `
                                                            <tr>
                                                                <td><strong class="text-primary">${this.escapeHtml(student.studentId || 'N/A')}</strong></td>
                                                                <td>${this.escapeHtml((student.firstName || '') + ' ' + (student.lastName || '')).trim() || 'N/A'}</td>
                                                                <td>${this.escapeHtml(student.email || 'N/A')}</td>
                                                                <td>${this.escapeHtml(student.phone || 'N/A')}</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        `}
                                    </div>

                                    <!-- Courses Tab -->
                                    <div class="tab-pane fade" id="courses-pane" role="tabpanel">
                                        ${courses.length === 0 ? `
                                            <div class="text-center py-4">
                                                <i class="bi bi-book text-muted" style="font-size: 3rem;"></i>
                                                <h5 class="mt-3 text-muted">No Courses Found</h5>
                                                <p class="text-muted">This department doesn't have any courses yet.</p>
                                            </div>
                                        ` : `
                                            <div class="table-responsive">
                                                <table class="table table-hover">
                                                    <thead class="table-light">
                                                        <tr>
                                                            <th>Course ID</th>
                                                            <th>Course Name</th>
                                                            <th>Students Enrolled</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${courses.map(course => `
                                                            <tr>
                                                                <td><strong class="text-primary">${this.escapeHtml(course.courseId)}</strong></td>
                                                                <td>${this.escapeHtml(course.courseName)}</td>
                                                                <td>
                                                                    <span class="badge bg-info" id="detailEnrolled_${course.courseId}">Loading...</span>
                                                                </td>
                                                                <td>
                                                                    <button class="btn btn-sm btn-outline-info" onclick="dashboard.viewCourseStudents('${course.courseId}')">
                                                                        <i class="bi bi-people me-1"></i>View Students
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('departmentDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add new modal to body
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show modal
            new bootstrap.Modal(document.getElementById('departmentDetailsModal')).show();

            // Load enrollment counts and calculate total
            this.loadDepartmentEnrollmentStatistics(courses, departmentId);

        } catch (error) {
            console.error('Error loading department details:', error);
            this.showAlert('Failed to load department details.', 'danger');
        }
    }

    async loadCourseEnrollmentCount(courseId, prefix = 'courseStudentCount_') {
        try {
            const response = await fetch(`${this.baseURL}/courses/${courseId}/students`);
            if (response.ok) {
                const students = await response.json();
                const countElement = document.getElementById(`${prefix}${courseId}`);
                if (countElement) {
                    countElement.textContent = students.length;
                }
                return students.length;
            }
        } catch (error) {
            console.error(`Error loading enrollment count for course ${courseId}:`, error);
            const countElement = document.getElementById(`${prefix}${courseId}`);
            if (countElement) {
                countElement.textContent = '0';
            }
            return 0;
        }
        return 0;
    }

    async loadDepartmentEnrollmentStatistics(courses, departmentId) {
        try {
            const enrollmentCounts = await Promise.all(
                courses.map(course => this.loadCourseEnrollmentCount(course.courseId, 'detailEnrolled_'))
            );

            const totalEnrollments = enrollmentCounts.reduce((sum, count) => sum + count, 0);
            const totalElement = document.getElementById(`totalEnrollments_${departmentId}`);
            if (totalElement) {
                totalElement.textContent = totalEnrollments;
            }
        } catch (error) {
            console.error('Error calculating enrollment statistics:', error);
            const totalElement = document.getElementById(`totalEnrollments_${departmentId}`);
            if (totalElement) {
                totalElement.textContent = '0';
            }
        }
    }

    convertDepartmentsToCSV(data) {
        const headers = ['Department ID', 'Department Name', 'Description'];
        const rows = data.map(dept => [
            dept.departmentId,
            dept.name,
            dept.description || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }


    // Course Management
    async loadCourses() {
        try {
            const courses = await this.fetchJSON('/courses');
            this.courses = courses; // Store for filtering
            this.renderCoursesTable(courses);
            this.updateCourseStatistics(courses);
            this.setupCourseSearch();
            await this.loadDepartmentOptions('courseDepartment');
            await this.loadDepartmentOptionsForFilter();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showAlert('Error loading courses', 'danger');
        }
    }

    renderCoursesTable(courses) {
        const tbody = document.getElementById('coursesTableBody');
        tbody.innerHTML = '';

        if (courses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                        <p class="mt-2 text-muted">No courses found</p>
                    </td>
                </tr>
            `;
            return;
        }

        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong class="text-primary">${this.escapeHtml(course.courseId)}</strong></td>
                <td><div class="fw-medium">${this.escapeHtml(course.courseName)}</div></td>
                <td>
                    <span class="badge bg-secondary">${course.department ? this.escapeHtml(course.department.name) : 'No Department'}</span>
                </td>
                <td>
                    <button class="btn btn-link p-0 text-decoration-none" onclick="dashboard.viewCourseStudents('${course.courseId}')">
                        <span class="badge bg-info">
                            <i class="bi bi-people me-1"></i>
                            <span id="courseStudentCount_${course.courseId}">Loading...</span>
                        </span>
                    </button>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info" onclick="dashboard.viewCourseStudents('${course.courseId}')" title="View Students">
                            <i class="bi bi-people"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="dashboard.editCourse('${course.courseId}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="dashboard.confirmDeleteCourse('${course.courseId}', '${this.escapeHtml(course.courseName)}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);

            // Load student count for each course
            this.loadCourseStudentCount(course.courseId);
        });
    }

    async loadCourseStudentCount(courseId) {
        try {
            const response = await fetch(`${this.baseURL}/courses/${courseId}/students`);
            if (response.ok) {
                const students = await response.json();
                const countElement = document.getElementById(`courseStudentCount_${courseId}`);
                if (countElement) {
                    countElement.textContent = students.length;
                }
            }
        } catch (error) {
            console.error(`Error loading student count for course ${courseId}:`, error);
            const countElement = document.getElementById(`courseStudentCount_${courseId}`);
            if (countElement) {
                countElement.textContent = '0';
            }
        }
    }

    async updateCourseStatistics(courses) {
        const totalCourses = courses.length;
        document.getElementById('totalCourseCount').textContent = totalCourses;

        // Count unique departments
        const uniqueDepartments = new Set(courses.map(course => course.department?.departmentId).filter(Boolean));
        document.getElementById('courseDepartments').textContent = uniqueDepartments.size;

        // Calculate total enrollments
        try {
            const enrollmentCounts = await Promise.all(courses.map(async course => {
                try {
                    const response = await fetch(`${this.baseURL}/courses/${course.courseId}/students`);
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
            document.getElementById('totalCourseEnrollments').textContent = totalEnrollments;
            document.getElementById('avgStudentsPerCourseAdmin').textContent =
                totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0;
        } catch (error) {
            console.error('Error calculating course statistics:', error);
        }
    }

    setupCourseSearch() {
        const searchInput = document.getElementById('courseSearchInput');
        const departmentFilter = document.getElementById('courseDepartmentFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCourses(e.target.value, departmentFilter ? departmentFilter.value : '');
            });
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.filterCourses(searchInput ? searchInput.value : '', e.target.value);
            });
        }
    }

    filterCourses(searchTerm, departmentId) {
        if (!this.courses) return;

        let filtered = this.courses;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.courseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (course.department?.name && course.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by department
        if (departmentId) {
            filtered = filtered.filter(course =>
                course.department?.departmentId === departmentId
            );
        }

        this.renderCoursesTable(filtered);
    }

    async loadDepartmentOptionsForFilter() {
        try {
            const departments = await this.fetchJSON('/departments');
            const filterSelect = document.getElementById('courseDepartmentFilter');

            if (filterSelect) {
                filterSelect.innerHTML = '<option value="">All Departments</option>';
                departments.forEach(dept => {
                    const option = new Option(dept.name, dept.departmentId);
                    filterSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading departments for filter:', error);
        }
    }

    openCourseModal() {
        this.currentEditId = null;
        this.currentEditType = 'course';
        document.getElementById('courseModalTitle').textContent = 'Add New Course';
        document.getElementById('courseForm').reset();
    }

    async editCourse(courseId) {
        const course = this.courses?.find(c => c.courseId === courseId);
        if (!course) return;

        this.currentEditId = courseId;
        this.currentEditType = 'course';
        document.getElementById('courseModalTitle').textContent = 'Edit Course';

        // Fill form with current data
        document.getElementById('courseName').value = course.courseName;

        // Wait for department options to load, then set value
        await this.loadDepartmentOptions('courseDepartment');
        document.getElementById('courseDepartment').value = course.department?.departmentId || '';

        // Show modal
        new bootstrap.Modal(document.getElementById('courseModal')).show();
    }

    confirmDeleteCourse(courseId, courseName) {
        if (confirm(`Are you sure you want to delete the course "${courseName}"?\n\nThis action cannot be undone and will unenroll all students from this course.`)) {
            this.deleteCourse(courseId);
        }
    }

    async deleteCourse(courseId) {
        try {
            const response = await this.deleteData(`/courses/${courseId}`);
            if (response.ok) {
                this.showAlert('Course deleted successfully!', 'success');
                this.loadCourses();
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showAlert('Failed to delete course: ' + error.message, 'danger');
        }
    }

    async viewCourseStudents(courseId) {
        try {
            const course = this.courses?.find(c => c.courseId === courseId);
            const response = await fetch(`${this.baseURL}/courses/${courseId}/students`);

            if (!response.ok) {
                throw new Error('Failed to load students');
            }

            const students = await response.json();

            // Create a modal to show course students
            const modalHtml = `
                <div class="modal fade" id="courseStudentsViewModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="bi bi-people me-2"></i>
                                    Students enrolled in ${course ? course.courseName : courseId}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                ${students.length === 0 ? `
                                    <div class="text-center py-4">
                                        <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                                        <h5 class="mt-3 text-muted">No Students Enrolled</h5>
                                        <p class="text-muted">This course doesn't have any enrolled students yet.</p>
                                    </div>
                                ` : `
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead class="table-light">
                                                <tr>
                                                    <th>Student ID</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Department</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${students.map(student => `
                                                    <tr>
                                                        <td><strong class="text-primary">${this.escapeHtml(student.studentId || 'N/A')}</strong></td>
                                                        <td>${this.escapeHtml((student.firstName || '') + ' ' + (student.lastName || '')).trim() || 'N/A'}</td>
                                                        <td>${this.escapeHtml(student.email || 'N/A')}</td>
                                                        <td>${student.department ? this.escapeHtml(student.department.name) : 'N/A'}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('courseStudentsViewModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add new modal to body
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show modal
            new bootstrap.Modal(document.getElementById('courseStudentsViewModal')).show();

        } catch (error) {
            console.error('Error loading course students:', error);
            this.showAlert('Failed to load students for this course.', 'danger');
        }
    }

    exportCourses() {
        if (!this.courses || this.courses.length === 0) {
            this.showAlert('No data to export', 'warning');
            return;
        }

        const csvContent = this.convertCoursesToCSV(this.courses);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `courses_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showAlert('Data exported successfully!', 'success');
    }

    convertCoursesToCSV(data) {
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

    async loadDepartmentOptions(selectId) {
        try {
            const departments = await this.fetchJSON('/departments');
            const select = document.getElementById(selectId);

            if (select) {
                // Keep the first option and clear the rest
                const firstOption = select.options[0];
                select.innerHTML = '';
                if (firstOption) {
                    select.appendChild(firstOption);
                }

                departments.forEach(dept => {
                    const option = new Option(dept.name, dept.departmentId);
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading department options:', error);
        }
    }

    async saveDepartment() {
        try {
            const form = document.getElementById('departmentForm');
            const formData = new FormData(form);

            const departmentData = {
                departmentId: formData.get('departmentId') || this.generateDepartmentId(),
                name: formData.get('departmentName'),
                description: formData.get('departmentDescription') || ''
            };

            // Validate required fields
            if (!departmentData.name || !departmentData.name.trim()) {
                this.showAlert('Department name is required', 'danger');
                return;
            }

            let response;
            if (this.currentEditId) {
                // Update existing department
                departmentData.departmentId = this.currentEditId;
                response = await this.putData(`/departments/${this.currentEditId}`, departmentData);
            } else {
                // Create new department
                response = await this.postData('/departments', departmentData);
            }

            if (response.ok) {
                this.showAlert(
                    this.currentEditId ? 'Department updated successfully!' : 'Department created successfully!',
                    'success'
                );

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('departmentModal'));
                if (modal) {
                    modal.hide();
                }

                // Reload departments
                this.loadDepartments();

                // Reset form and edit state
                form.reset();
                this.currentEditId = null;
                this.currentEditType = null;
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to save department');
            }
        } catch (error) {
            console.error('Error saving department:', error);
            this.showAlert('Failed to save department: ' + error.message, 'danger');
        }
    }

    async saveCourse() {
        try {
            const form = document.getElementById('courseForm');
            const formData = new FormData(form);

            const courseData = {
                courseId: formData.get('courseId') || this.generateCourseId(),
                courseName: formData.get('courseName'),
                department: {
                    departmentId: formData.get('courseDepartment')
                }
            };

            // Validate required fields
            if (!courseData.courseName || !courseData.courseName.trim()) {
                this.showAlert('Course name is required', 'danger');
                return;
            }

            if (!courseData.department.departmentId) {
                this.showAlert('Please select a department', 'danger');
                return;
            }

            let response;
            if (this.currentEditId) {
                // Update existing course
                courseData.courseId = this.currentEditId;
                response = await this.putData(`/courses/${this.currentEditId}`, courseData);
            } else {
                // Create new course
                response = await this.postData('/courses', courseData);
            }

            if (response.ok) {
                this.showAlert(
                    this.currentEditId ? 'Course updated successfully!' : 'Course created successfully!',
                    'success'
                );

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
                if (modal) {
                    modal.hide();
                }

                // Reload courses
                this.loadCourses();

                // Reset form and edit state
                form.reset();
                this.currentEditId = null;
                this.currentEditType = null;
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to save course');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showAlert('Failed to save course: ' + error.message, 'danger');
        }
    }

    generateDepartmentId() {
        // Generate a simple department ID (you might want to use a different strategy)
        return 'DEPT' + Date.now().toString().slice(-6);
    }

    generateCourseId() {
        // Generate a simple course ID (you might want to use a different strategy)
        return 'COURSE' + Date.now().toString().slice(-6);
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

        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.querySelector('.alert-dismissible');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
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

function changePassword() {
    dashboard.changePassword();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new AdminDashboard();
});
