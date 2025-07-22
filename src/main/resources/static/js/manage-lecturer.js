// Lecturer Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadLecturerInfo();
    setupEventListeners();
});

// Load lecturer information using the get-lecturer-info endpoint
async function loadLecturerInfo() {
    try {
        showLoading();

        const response = await fetch('/api/lecturer/get-lecturer-info');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const lecturerData = await response.json();
        displayLecturerInfo(lecturerData);
        hideLoading();

    } catch (error) {
        console.error('Error loading lecturer info:', error);
        showError('Failed to load your profile information. Please try again or contact support.');
        hideLoading();
    }
}

// Display lecturer information on the page
function displayLecturerInfo(data) {
    try {
        // Update personal information
        document.getElementById('firstName').textContent = data.firstName || 'Not provided';
        document.getElementById('lastName').textContent = data.lastName || 'Not provided';
        document.getElementById('email').textContent = data.email || 'Not provided';
        document.getElementById('phone').textContent = data.phone || 'Not provided';
        document.getElementById('lecturerId').textContent = data.lecturerID || 'Not provided';

        // Update LIC status
        const licBadge = document.getElementById('licBadge');
        if (data.isLIC === 'true') {
            licBadge.textContent = 'Lecturer in Charge (LIC)';
            licBadge.className = 'badge bg-success';
        } else {
            licBadge.textContent = 'Lecturer';
            licBadge.className = 'badge bg-secondary';
        }

        // Display courses
        displayCourses(data.courses);

        // Show profile content with animation
        document.getElementById('profileContent').classList.remove('d-none');
        document.getElementById('profileContent').classList.add('fade-in');

    } catch (error) {
        console.error('Error displaying lecturer info:', error);
        showError('Error displaying profile data');
    }
}

// Display lecturer's courses
function displayCourses(coursesData) {
    const coursesContainer = document.getElementById('coursesContainer');

    if (!coursesData || coursesData === 'No Courses' || coursesData === 'null') {
        coursesContainer.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-book-open"></i>
                <p class="mb-0">No courses assigned</p>
            </div>
        `;
        return;
    }

    try {
        let courses = [];

        if (typeof coursesData === 'string') {
            if (coursesData.startsWith('[') && coursesData.endsWith(']')) {
                courses = JSON.parse(coursesData);
            } else {
                courses = coursesData.split(',').map(course => course.trim()).filter(course => course);
            }
        } else if (Array.isArray(coursesData)) {
            courses = coursesData;
        }

        if (courses.length === 0) {
            coursesContainer.innerHTML = `
                <div class="no-courses">
                    <i class="fas fa-book-open"></i>
                    <p class="mb-0">No courses assigned</p>
                </div>
            `;
            return;
        }

        let coursesHtml = '';
        courses.forEach((course, index) => {
            const courseName = typeof course === 'object' ? (course.courseName || course.name) : course;
            const courseCode = typeof course === 'object' ? (course.courseCode || course.code) : `COURSE-${index + 1}`;

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
                <div class="course-name">Course Information</div>
                <div class="course-code">${coursesData}</div>
            </div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Change password button
    document.getElementById('changePasswordBtn').addEventListener('click', function() {
        showChangePasswordModal();
    });

    // Save password button in modal
    document.getElementById('savePasswordBtn').addEventListener('click', function() {
        handlePasswordChange();
    });

    // Password visibility toggles
    setupPasswordToggle('toggleCurrentPassword', 'currentPassword');
    setupPasswordToggle('toggleNewPassword', 'newPassword');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');

    // Password validation
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
    document.getElementById('newPassword').addEventListener('input', validatePasswordStrength);
}

// Setup password visibility toggle
function setupPasswordToggle(buttonId, inputId) {
    document.getElementById(buttonId).addEventListener('click', function() {
        const input = document.getElementById(inputId);
        const icon = this.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    });
}

// Show change password modal
function showChangePasswordModal() {
    // Clear previous inputs and errors
    document.getElementById('changePasswordForm').reset();
    document.getElementById('passwordError').classList.add('d-none');

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    modal.show();
}

// Handle password change
async function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate inputs
    if (!validatePasswordInputs(currentPassword, newPassword, confirmPassword)) {
        return;
    }

    try {
        // Disable button during request
        const saveBtn = document.getElementById('savePasswordBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Changing...';

        const response = await fetch('/api/lecturer/changePassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: document.getElementById('lecturerId').textContent, // Use lecturer ID as username
                newPassword: newPassword
            })
        });

        if (response.ok) {
            // Success - hide modal and show success message
            const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
            modal.hide();
            showSuccess('Password changed successfully!');
        } else {
            const errorText = await response.text();
            showPasswordError(`Failed to change password: ${errorText}`);
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showPasswordError('Error changing password. Please try again.');
    } finally {
        // Re-enable button
        const saveBtn = document.getElementById('savePasswordBtn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Change Password';
    }
}

// Validate password inputs
function validatePasswordInputs(currentPassword, newPassword, confirmPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
        showPasswordError('All password fields are required.');
        return false;
    }

    if (newPassword.length < 6) {
        showPasswordError('New password must be at least 6 characters long.');
        return false;
    }

    if (newPassword !== confirmPassword) {
        showPasswordError('New password and confirmation do not match.');
        return false;
    }

    if (currentPassword === newPassword) {
        showPasswordError('New password must be different from current password.');
        return false;
    }

    return true;
}

// Validate password match
function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');

    if (confirmPassword && newPassword !== confirmPassword) {
        confirmInput.classList.add('is-invalid');
        confirmInput.classList.remove('is-valid');
    } else if (confirmPassword) {
        confirmInput.classList.add('is-valid');
        confirmInput.classList.remove('is-invalid');
    } else {
        confirmInput.classList.remove('is-valid', 'is-invalid');
    }
}

// Validate password strength
function validatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const input = document.getElementById('newPassword');

    if (password.length === 0) {
        input.classList.remove('is-valid', 'is-invalid');
        return;
    }

    if (password.length < 6) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    } else {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
    }
}

// Show password error in modal
function showPasswordError(message) {
    const errorDiv = document.getElementById('passwordError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('errorMessage').classList.add('d-none');
    document.getElementById('successMessage').classList.add('d-none');
    document.getElementById('profileContent').classList.add('d-none');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Show error message
function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').classList.remove('d-none');
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('profileContent').classList.add('d-none');
}

// Show success message
function showSuccess(message) {
    document.getElementById('successText').textContent = message;
    document.getElementById('successMessage').classList.remove('d-none');

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
        document.getElementById('successMessage').classList.add('d-none');
    }, 5000);
}

// Refresh profile data
function refreshProfile() {
    loadLecturerInfo();
}

// Export functions for potential external use
window.lecturerManagement = {
    refresh: refreshProfile,
    changePassword: showChangePasswordModal
};
