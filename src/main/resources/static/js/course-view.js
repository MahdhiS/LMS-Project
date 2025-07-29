// Course View JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadCourseDetails();
});

// Load course details from URL parameters
async function loadCourseDetails() {
    try {
        showLoading();

        // Get course data from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        const courseName = urlParams.get('courseName');
        const courseCode = urlParams.get('courseCode');
        const departmentName = urlParams.get('department');

        if (!courseId && !courseName) {
            throw new Error('No course information provided');
        }

        // Display the course information
        displayCourseDetails({
            courseId: courseId,
            courseName: courseName,
            courseCode: courseCode,
            departmentName: departmentName
        });

        hideLoading();

    } catch (error) {
        console.error('Error loading course details:', error);
        showError('Failed to load course details. Please try again.');
        hideLoading();
    }
}

// Display course details on the page
function displayCourseDetails(courseData) {
    try {
        // Update main course header
        document.getElementById('courseName').textContent = courseData.courseName || 'Unknown Course';
        document.getElementById('courseCode').textContent = courseData.courseCode || 'N/A';

        // Update detailed information
        document.getElementById('courseNameDetail').textContent = courseData.courseName || 'Not provided';
        document.getElementById('courseCodeDetail').textContent = courseData.courseCode || 'Not provided';

        // Update department information
        const departmentBadge = document.getElementById('departmentBadge');
        departmentBadge.textContent = courseData.departmentName || 'No Department';

        // Display lecturers (for now, showing sample data since we don't have lecturer info in current APIs)
        displayLecturers(courseData.lecturers);

        // Show course content with animation
        document.getElementById('courseContent').classList.remove('d-none');
        document.getElementById('courseContent').classList.add('fade-in');

    } catch (error) {
        console.error('Error displaying course details:', error);
        showError('Error displaying course information');
    }
}

// Display course lecturers
function displayLecturers(lecturersData) {
    const lecturersContainer = document.getElementById('lecturersContainer');

    // For now, show sample lecturer data since we don't have this from current APIs
    // In the future, this can be updated when lecturer data is available
    const sampleLecturers = [
        {
            name: 'Dr. John Smith',
            email: 'john.smith@university.edu',
            initials: 'JS'
        },
        {
            name: 'Prof. Sarah Johnson',
            email: 'sarah.johnson@university.edu',
            initials: 'SJ'
        }
    ];

    if (!lecturersData || lecturersData.length === 0) {
        // Show sample data for demonstration
        let lecturersHtml = '<div class="lecturers-container">';
        sampleLecturers.forEach(lecturer => {
            lecturersHtml += `
                <div class="lecturer-item">
                    <div class="lecturer-avatar">${lecturer.initials}</div>
                    <div class="lecturer-info">
                        <div class="lecturer-name">${lecturer.name}</div>
                        <p class="lecturer-email">${lecturer.email}</p>
                    </div>
                </div>
            `;
        });
        lecturersHtml += '</div>';
        lecturersContainer.innerHTML = lecturersHtml;
        return;
    }

    // Handle actual lecturer data when available
    try {
        let lecturersHtml = '<div class="lecturers-container">';
        lecturersData.forEach(lecturer => {
            const name = lecturer.firstName && lecturer.lastName
                ? `${lecturer.firstName} ${lecturer.lastName}`
                : lecturer.name || 'Unknown Lecturer';
            const email = lecturer.email || 'No email provided';
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

            lecturersHtml += `
                <div class="lecturer-item">
                    <div class="lecturer-avatar">${initials}</div>
                    <div class="lecturer-info">
                        <div class="lecturer-name">${name}</div>
                        <p class="lecturer-email">${email}</p>
                    </div>
                </div>
            `;
        });
        lecturersHtml += '</div>';
        lecturersContainer.innerHTML = lecturersHtml;

    } catch (error) {
        console.error('Error displaying lecturers:', error);
        lecturersContainer.innerHTML = `
            <div class="no-lecturers">
                <i class="fas fa-user-tie fa-2x mb-2"></i>
                <p class="mb-0 small">Unable to load lecturer information</p>
            </div>
        `;
    }
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
    document.getElementById('courseContent').classList.add('d-none');
    document.getElementById('errorMessage').classList.add('d-none');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    errorText.textContent = message;
    errorDiv.classList.remove('d-none');
    document.getElementById('courseContent').classList.add('d-none');
}
