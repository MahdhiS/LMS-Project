// Department Management JavaScript
class DepartmentManager {
    constructor() {
        this.departments = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadDepartments();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterDepartments(e.target.value);
        });

        // Form submission
        document.getElementById('departmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDepartment();
        });
    }

    async loadDepartments() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/departments');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.departments = await response.json();
            this.renderDepartments();
            this.updateStatistics();
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading departments:', error);
            this.showError('Failed to load departments. Please try again.');
            this.showLoading(false);
        }
    }

    renderDepartments(departmentsToRender = this.departments) {
        const tbody = document.getElementById('departmentsTableBody');
        const emptyState = document.getElementById('emptyState');
        const tableCard = document.querySelector('.card:has(#departmentsTableBody)').closest('.card');

        if (departmentsToRender.length === 0) {
            tbody.innerHTML = '';
            tableCard.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tableCard.style.display = 'block';
        emptyState.style.display = 'none';

        tbody.innerHTML = departmentsToRender.map(dept => `
            <tr>
                <td>
                    <strong class="text-primary">${this.escapeHtml(dept.departmentId)}</strong>
                </td>
                <td>
                    <div class="fw-medium">${this.escapeHtml(dept.name)}</div>
                </td>
                <td>
                    <div class="text-muted" style="max-width: 300px;">
                        ${dept.description ? this.escapeHtml(dept.description) : '<em>No description</em>'}
                    </div>
                </td>
                <td>
                    <button class="btn btn-link p-0 text-decoration-none" onclick="departmentManager.viewStudents('${dept.departmentId}')">
                        <span class="badge bg-info student-count-badge">
                            <i class="bi bi-people me-1"></i>
                            <span id="studentCount_${dept.departmentId}">Loading...</span>
                        </span>
                    </button>
                </td>
                <td class="action-buttons">
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info" onclick="departmentManager.viewStudents('${dept.departmentId}')" title="View Students">
                            <i class="bi bi-people"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="departmentManager.editDepartment('${dept.departmentId}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="departmentManager.confirmDelete('${dept.departmentId}', '${this.escapeHtml(dept.name)}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Load student counts for each department
        departmentsToRender.forEach(dept => {
            this.loadStudentCount(dept.departmentId);
        });
    }

    async loadStudentCount(departmentId) {
        try {
            const response = await fetch(`/api/departments/${departmentId}/students`);
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

    updateStatistics() {
        const totalDepartments = this.departments.length;
        document.getElementById('totalDepartments').textContent = totalDepartments;

        // Calculate total students across all departments
        let totalStudents = 0;
        Promise.all(this.departments.map(async dept => {
            try {
                const response = await fetch(`/api/departments/${dept.departmentId}/students`);
                if (response.ok) {
                    const students = await response.json();
                    return students.length;
                }
            } catch (error) {
                return 0;
            }
            return 0;
        })).then(studentCounts => {
            totalStudents = studentCounts.reduce((sum, count) => sum + count, 0);
            document.getElementById('totalStudents').textContent = totalStudents;
            document.getElementById('avgStudentsPerDept').textContent =
                totalDepartments > 0 ? Math.round(totalStudents / totalDepartments) : 0;
        });
    }

    filterDepartments(searchTerm) {
        const filtered = this.departments.filter(dept =>
            dept.departmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderDepartments(filtered);
    }

    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Department';
        document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i>Save Department';
        document.getElementById('departmentId').disabled = false;
        document.getElementById('departmentForm').reset();
    }

    async editDepartment(departmentId) {
        const department = this.departments.find(d => d.departmentId === departmentId);
        if (!department) return;

        this.currentEditId = departmentId;
        document.getElementById('modalTitle').textContent = 'Edit Department';
        document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i>Update Department';

        // Disable ID field during edit
        document.getElementById('departmentId').disabled = true;
        document.getElementById('departmentId').value = department.departmentId;
        document.getElementById('departmentName').value = department.name;
        document.getElementById('departmentDescription').value = department.description || '';

        // Show modal
        new bootstrap.Modal(document.getElementById('departmentModal')).show();
    }

    async saveDepartment() {
        const form = document.getElementById('departmentForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const departmentData = {
            departmentId: document.getElementById('departmentId').value.trim(),
            name: document.getElementById('departmentName').value.trim(),
            description: document.getElementById('departmentDescription').value.trim()
        };

        try {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Saving...';

            let response;
            if (this.currentEditId) {
                // Update existing department
                response = await fetch(`/api/departments/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(departmentData)
                });
            } else {
                // Create new department
                response = await fetch('/api/departments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(departmentData)
                });
            }

            if (response.ok) {
                this.showSuccess(this.currentEditId ? 'Department updated successfully!' : 'Department created successfully!');
                bootstrap.Modal.getInstance(document.getElementById('departmentModal')).hide();
                this.loadDepartments();
            } else {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to save department');
            }
        } catch (error) {
            console.error('Error saving department:', error);
            this.showError('Failed to save department: ' + error.message);
        } finally {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = this.currentEditId ?
                '<i class="bi bi-check-circle me-1"></i>Update Department' :
                '<i class="bi bi-check-circle me-1"></i>Save Department';
        }
    }

    confirmDelete(departmentId, departmentName) {
        document.getElementById('deleteDeptName').textContent = departmentName;
        document.getElementById('confirmDeleteBtn').onclick = () => this.deleteDepartment(departmentId);
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
    }

    async deleteDepartment(departmentId) {
        try {
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Deleting...';

            const response = await fetch(`/api/departments/delete/${departmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Department deleted successfully!');
                bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
                this.loadDepartments();
            } else {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to delete department');
            }
        } catch (error) {
            console.error('Error deleting department:', error);
            this.showError('Failed to delete department: ' + error.message);
        } finally {
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-trash me-1"></i>Delete Department';
        }
    }

    async viewStudents(departmentId) {
        try {
            const department = this.departments.find(d => d.departmentId === departmentId);
            document.getElementById('studentModalDeptName').textContent = department ? department.name : departmentId;

            const response = await fetch(`/api/departments/${departmentId}/students`);
            if (!response.ok) {
                throw new Error('Failed to load students');
            }

            const students = await response.json();
            const container = document.getElementById('studentsTableContainer');

            if (students.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
                        <h5 class="mt-3 text-muted">No Students Found</h5>
                        <p class="text-muted">This department doesn't have any students yet.</p>
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
                `;
            }

            new bootstrap.Modal(document.getElementById('studentsModal')).show();
        } catch (error) {
            console.error('Error loading students:', error);
            this.showError('Failed to load students for this department.');
        }
    }

    refreshData() {
        this.loadDepartments();
        this.showSuccess('Data refreshed successfully!');
    }

    exportData() {
        if (this.departments.length === 0) {
            this.showError('No data to export');
            return;
        }

        const csvContent = this.convertToCSV(this.departments);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `departments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showSuccess('Data exported successfully!');
    }

    convertToCSV(data) {
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
let departmentManager;

function openAddModal() {
    departmentManager.openAddModal();
}

function saveDepartment() {
    departmentManager.saveDepartment();
}

function refreshData() {
    departmentManager.refreshData();
}

function exportData() {
    departmentManager.exportData();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    departmentManager = new DepartmentManager();
});
