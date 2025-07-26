// Student Public Profile JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get student ID from URL path
    const studentId = getStudentIdFromPath();

    if (studentId) {
        loadStudentProfile(studentId);
    } else {
        showError('Invalid student ID in URL');
    }
});

// Extract student ID from URL path (/student/STU-123)
function getStudentIdFromPath() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Get the last part of the path
}

// Load student profile data from API
async function loadStudentProfile(studentId) {
    try {
        showLoading();

        const response = await fetch(`/api/students/${studentId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const studentData = await response.json();
        displayStudentProfile(studentData);
        hideLoading();

    } catch (error) {
        console.error('Error loading student profile:', error);
        showError('Failed to load student profile. Please check if the student ID is valid.');
        hideLoading();
    }
}

// Display student profile data on the page
function displayStudentProfile(data) {
    try {
        // Update profile header
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        document.getElementById('studentName').textContent = fullName || 'Unknown Student';
        document.getElementById('studentIdBadge').textContent = data.studentId || 'N/A';

        // Update department badge
        const departmentName = data.department ? data.department.departmentName || data.department.name || 'No Department' : 'No Department';
        document.getElementById('departmentBadge').textContent = departmentName;

        // Update contact information
        document.getElementById('fullName').textContent = fullName || 'Not provided';
        document.getElementById('emailValue').textContent = data.email || 'Not provided';
        document.getElementById('phoneValue').textContent = data.phone || 'Not provided';
        document.getElementById('studentIdValue').textContent = data.studentId || 'Not provided';

        // Update academic information
        document.getElementById('departmentValue').textContent = departmentName;
        document.getElementById('dobValue').textContent = data.dateOfBirth || 'Not provided';
        document.getElementById('genderValue').textContent = data.gender || 'Not provided';

        // Update department name in stats
        document.getElementById('departmentName').textContent = departmentName;

        // Update courses and course count
        const courseCount = displayCourses(data.courses);
        document.getElementById('courseCount').textContent = courseCount;

        // Show profile content with animation
        document.getElementById('profileContent').classList.remove('d-none');
        document.getElementById('profileContent').classList.add('fade-in');

    } catch (error) {
        console.error('Error displaying student profile:', error);
        showError('Error displaying profile data');
    }
}

// Display student's courses and return course count
function displayCourses(coursesData) {
    const coursesContainer = document.getElementById('coursesContainer');

    if (!coursesData || coursesData.length === 0) {
        coursesContainer.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-book-open"></i>
                <p class="mb-0">No courses enrolled</p>
            </div>
        `;
        return 0;
    }

    try {
        let courses = [];

        if (Array.isArray(coursesData)) {
            courses = coursesData;
        } else if (typeof coursesData === 'string') {
            // Try to parse if it's a JSON string
            try {
                courses = JSON.parse(coursesData);
            } catch (e) {
                // If parsing fails, treat as single course or comma-separated
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
            return 0;
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
        return courses.length;

    } catch (error) {
        console.error('Error parsing courses data:', error);
        coursesContainer.innerHTML = `
            <div class="course-item">
                <div class="course-name">Course Information Available</div>
                <div class="course-code">Contact administrator for details</div>
            </div>
        `;
        return 1;
    }
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

// Hide error message
function hideError() {
    document.getElementById('errorMessage').classList.add('d-none');
}

// Add some utility functions for better user experience
document.addEventListener('DOMContentLoaded', function() {
    // Add click-to-copy functionality for student ID
    const studentIdElement = document.getElementById('studentIdValue');
    if (studentIdElement) {
        studentIdElement.style.cursor = 'pointer';
        studentIdElement.title = 'Click to copy Student ID';

        studentIdElement.addEventListener('click', function() {
            const studentId = this.textContent;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(studentId).then(function() {
                    // Show temporary success message
                    const originalText = studentIdElement.textContent;
                    studentIdElement.textContent = 'Copied!';
                    studentIdElement.style.color = '#28a745';

                    setTimeout(function() {
                        studentIdElement.textContent = originalText;
                        studentIdElement.style.color = '';
                    }, 1500);
                });
            }
        });
    }
});
