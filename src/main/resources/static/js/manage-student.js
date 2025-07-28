// Manage Student Profile JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadStudentProfile();
    setupPasswordModal();
});

// Load current student's profile data from API
async function loadStudentProfile() {
    try {
        showLoading();

        // Get current student data from session/API
        const response = await fetch('/api/students/get-student-info');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const studentData = await response.json();
        displayStudentProfile(studentData);
        hideLoading();

    } catch (error) {
        console.error('Error loading student profile:', error);
        showError('Failed to load your profile. Please try again.');
        hideLoading();
    }
}

// Display student profile data on the page
function displayStudentProfile(data) {
    try {
        // Update personal information
        document.getElementById('firstName').textContent = data.firstName || 'Not provided';
        document.getElementById('lastName').textContent = data.lastName || 'Not provided';
        document.getElementById('email').textContent = data.email || 'Not provided';
        document.getElementById('phone').textContent = data.phone || 'Not provided';
        document.getElementById('studentId').textContent = data.studentId || 'Not provided';
        document.getElementById('dateOfBirth').textContent = data.dateOfBirth || 'Not provided';
        document.getElementById('gender').textContent = data.gender || 'Not provided';

        // Update department information
        const departmentName = data.department ?
            (data.department.departmentName || data.department.name || 'No Department') :
            'No Department';
        document.getElementById('departmentBadge').textContent = departmentName;

        // Update courses
        displayCourses(data.courses);

        // Show profile content with animation
        document.getElementById('profileContent').classList.remove('d-none');
        document.getElementById('profileContent').classList.add('fade-in');

    } catch (error) {
        console.error('Error displaying student profile:', error);
        showError('Error displaying profile data');
    }
}

// Display student's enrolled courses
function displayCourses(coursesData) {
    const coursesContainer = document.getElementById('coursesContainer');

    if (!coursesData || coursesData.length === 0) {
        coursesContainer.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-book-open"></i>
                <p class="mb-0">No courses enrolled</p>
            </div>
        `;
        return;
    }

    try {
        let courses = [];

        if (Array.isArray(coursesData)) {
            courses = coursesData;
        } else if (typeof coursesData === 'string') {
            try {
                courses = JSON.parse(coursesData);
            } catch (e) {
                courses = coursesData.split(',').map(course => course.trim()).filter(course => course);
            }
        }

        if (courses.length === 0) {
            coursesContainer.innerHTML = `
                <div class="no-courses">
                    <i class="fas fa-book-open"></i>
                    <p class="mb-0">No courses enrolled</p>
                </div>
            `;
            return;
        }

        // Display courses
        let coursesHtml = '';
        courses.forEach((course, index) => {
            let courseName, courseCode;

            if (typeof course === 'object' && course !== null) {
                courseName = course.courseName || course.name || course.title || `Course ${index + 1}`;
                courseCode = course.courseCode || course.code || course.id || `COURSE-${index + 1}`;
            } else {
                courseName = course.toString();
                courseCode = `COURSE-${index + 1}`;
            }

            coursesHtml += `
                <div class="course-item">
                    <div class="course-name">${courseName}</div>
                    <div class="course-code">${courseCode}</div>
                </div>
            `;
        });

        coursesContainer.innerHTML = coursesHtml;

    } catch (error) {
        console.error('Error parsing courses data:', error);
        coursesContainer.innerHTML = `
            <div class="course-item">
                <div class="course-name">Course Information Available</div>
                <div class="course-code">Contact administrator for details</div>
            </div>
        `;
    }
}

// Setup password change modal
function setupPasswordModal() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const form = document.getElementById('changePasswordForm');

    // Show modal
    changePasswordBtn.addEventListener('click', function() {
        clearPasswordForm();
        modal.show();
    });

    // Handle password change
    savePasswordBtn.addEventListener('click', function() {
        handlePasswordChange();
    });

    // Setup password visibility toggles
    setupPasswordToggles();

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handlePasswordChange();
    });
}

// Setup password visibility toggles
function setupPasswordToggles() {
    const toggles = [
        { button: 'toggleCurrentPassword', input: 'currentPassword' },
        { button: 'toggleNewPassword', input: 'newPassword' },
        { button: 'toggleConfirmPassword', input: 'confirmPassword' }
    ];

    toggles.forEach(toggle => {
        const button = document.getElementById(toggle.button);
        const input = document.getElementById(toggle.input);

        if (button && input) {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    });
}

// Handle password change
async function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    const saveBtn = document.getElementById('savePasswordBtn');

    // Clear previous errors
    errorDiv.classList.add('d-none');

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        showPasswordError('Please fill in all fields');
        return;
    }

    if (newPassword.length < 6) {
        showPasswordError('New password must be at least 6 characters long');
        return;
    }

    if (newPassword !== confirmPassword) {
        showPasswordError('New passwords do not match');
        return;
    }

    try {
        // Disable button and show loading
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Changing...';

        const response = await fetch('/api/students/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to change password');
        }

        // Success
        showSuccess('Password changed successfully!');
        bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
        clearPasswordForm();

    } catch (error) {
        console.error('Error changing password:', error);
        showPasswordError(error.message || 'Failed to change password. Please try again.');
    } finally {
        // Re-enable button
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Change Password';
    }
}

// Show password error in modal
function showPasswordError(message) {
    const errorDiv = document.getElementById('passwordError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

// Clear password form
function clearPasswordForm() {
    document.getElementById('changePasswordForm').reset();
    document.getElementById('passwordError').classList.add('d-none');
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
    document.getElementById('errorMessage').classList.add('d-none');
    document.getElementById('profileContent').classList.add('d-none');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}

// Show error message
function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').classList.remove('d-none');
    document.getElementById('loadingSpinner').classList.add('d-none');
    document.getElementById('profileContent').classList.add('d-none');
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const successText = document.getElementById('successText');

    successText.textContent = message;
    successDiv.classList.remove('d-none');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        successDiv.classList.add('d-none');
    }, 5000);
}

// Hide error message
function hideError() {
    document.getElementById('errorMessage').classList.add('d-none');
}

// Add some utility functions for better user experience
document.addEventListener('DOMContentLoaded', function() {
    // Add click-to-copy functionality for student ID
    const studentIdElement = document.getElementById('studentId');
    if (studentIdElement) {
        studentIdElement.style.cursor = 'pointer';
        studentIdElement.title = 'Click to copy Student ID';

        studentIdElement.addEventListener('click', function() {
            const studentId = this.textContent;
            if (navigator.clipboard && studentId !== 'Not provided' && studentId !== '-') {
                navigator.clipboard.writeText(studentId).then(function() {
                    // Show temporary success message
                    const originalText = studentIdElement.textContent;
                    const originalColor = studentIdElement.style.color;
                    studentIdElement.textContent = 'Copied!';
                    studentIdElement.style.color = '#28a745';

                    setTimeout(function() {
                        studentIdElement.textContent = originalText;
                        studentIdElement.style.color = originalColor;
                    }, 1500);
                });
            }
        });
    }
});
