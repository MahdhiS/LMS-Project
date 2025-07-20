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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
