// Lecturer Public Profile JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get lecturer ID from URL path
    const lecturerId = getLecturerIdFromPath();

    if (lecturerId) {
        loadLecturerProfile(lecturerId);
    } else {
        showError('Invalid lecturer ID in URL');
    }
});

// Extract lecturer ID from URL path (/lecturer/LEC-123)
function getLecturerIdFromPath() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Get the last part of the path
}

// Load lecturer profile data from API
async function loadLecturerProfile(lecturerId) {
    try {
        showLoading();

        const response = await fetch(`/api/lecturer/get/${lecturerId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const lecturerData = await response.json();
        displayLecturerProfile(lecturerData);
        hideLoading();

    } catch (error) {
        console.error('Error loading lecturer profile:', error);
        showError('Failed to load lecturer profile. Please check if the lecturer ID is valid.');
        hideLoading();
    }
}

// Display lecturer profile data on the page
function displayLecturerProfile(data) {
    try {
        // Update profile header
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        document.getElementById('lecturerName').textContent = fullName || 'Unknown Lecturer';
        document.getElementById('lecturerIdBadge').textContent = data.lecturerID || 'N/A';

        // Show LIC badge if lecturer is LIC
        if (data.isLIC === 'true') {
            document.getElementById('licBadge').classList.remove('d-none');
            document.getElementById('licStatus').textContent = 'Yes';
            document.getElementById('positionValue').textContent = 'Lecturer in Charge (LIC)';
        } else {
            document.getElementById('licStatus').textContent = 'No';
            document.getElementById('positionValue').textContent = 'Lecturer';
        }

        // Update contact information
        document.getElementById('fullName').textContent = fullName || 'Not provided';
        document.getElementById('emailValue').textContent = data.email || 'Not provided';
        document.getElementById('phoneValue').textContent = data.phone || 'Not provided';
        document.getElementById('lecturerIdValue').textContent = data.lecturerID || 'Not provided';

        // Update courses and course count
        const courseCount = displayCourses(data.courses);
        document.getElementById('courseCount').textContent = courseCount;

        // Show profile content with animation
        document.getElementById('profileContent').classList.remove('d-none');
        document.getElementById('profileContent').classList.add('fade-in');

    } catch (error) {
        console.error('Error displaying lecturer profile:', error);
        showError('Error displaying profile data');
    }
}

// Display lecturer's courses and return course count
function displayCourses(coursesData) {
    const coursesContainer = document.getElementById('coursesContainer');

    if (!coursesData || coursesData === 'No Courses' || coursesData === 'null') {
        coursesContainer.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-book-open"></i>
                <p class="mb-0">No courses assigned</p>
            </div>
        `;
        return 0;
    }

    try {
        // Try to parse courses data if it's a JSON string
        let courses = [];

        if (typeof coursesData === 'string') {
            // Handle different possible string formats
            if (coursesData.startsWith('[') && coursesData.endsWith(']')) {
                // JSON array format
                courses = JSON.parse(coursesData);
            } else {
                // Simple string format - split by comma or other delimiter
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
            return 0;
        }

        // Display courses
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
        return courses.length;

    } catch (error) {
        console.error('Error parsing courses data:', error);
        coursesContainer.innerHTML = `
            <div class="course-item">
                <div class="course-name">Course Information</div>
                <div class="course-code">${coursesData}</div>
            </div>
        `;
        return 1;
    }
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('errorMessage').classList.add('d-none');
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

// Utility function to format data safely
function formatData(data, defaultValue = 'Not provided') {
    return data && data !== 'null' && data !== null ? data : defaultValue;
}

// Refresh profile data
function refreshProfile() {
    const lecturerId = getLecturerIdFromPath();
    if (lecturerId) {
        loadLecturerProfile(lecturerId);
    }
}

// Add smooth scroll effect for better UX
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize smooth scrolling when page loads
document.addEventListener('DOMContentLoaded', addSmoothScrolling);

// Export functions for potential external use
window.lecturerProfile = {
    refresh: refreshProfile,
    getLecturerId: getLecturerIdFromPath
};
