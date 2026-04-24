// Profile Management
let isEditMode = false;
let originalData = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    setupEventListeners();
    calculateBMI();
});

// Go back to appropriate dashboard
function goBack() {
    const isAdmin = localStorage.getItem('adminToken');
    if (isAdmin) {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const editToggle = document.getElementById('editToggle');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const avatarEditBtn = document.getElementById('avatarEditBtn');
    const avatarUpload = document.getElementById('avatarUpload');

    if (editToggle) {
        editToggle.addEventListener('click', toggleEditMode);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfile);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }

    if (avatarEditBtn) {
        avatarEditBtn.addEventListener('click', () => {
            avatarUpload.click();
        });
    }

    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }

    // Real-time BMI calculation
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    if (heightInput && weightInput) {
        heightInput.addEventListener('input', calculateBMI);
        weightInput.addEventListener('input', calculateBMI);
    }
}

// Load User Profile
async function loadUserProfile() {
    try {
        // Check for both regular user token and admin token
        let token = localStorage.getItem('token');
        let isAdmin = false;
        
        if (!token) {
            token = localStorage.getItem('adminToken');
            isAdmin = true;
        }
        
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // If admin, load admin profile data
        if (isAdmin) {
            const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const adminData = {
                name: adminUser.username || 'Admin',
                email: 'admin@fitness.com',
                phone: '',
                dateOfBirth: '',
                gender: 'prefer-not',
                location: 'Admin Dashboard',
                height: 0,
                currentWeight: 0,
                targetWeight: 0,
                bodyFat: 0,
                muscleMass: 0,
                avatar: null
            };
            populateProfile(adminData);
            storeOriginalData();
            
            // Show admin notice
            showNotification('Viewing admin profile (limited features)', 'info');
            return;
        }

        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            populateProfile(data);
            storeOriginalData();
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
    }
}

// Populate Profile Data
function populateProfile(data) {
    // Basic Info
    document.getElementById('displayName').textContent = data.name || 'User';
    document.getElementById('displayEmail').textContent = data.email || '';
    document.getElementById('fullName').value = data.name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('dob').value = data.dateOfBirth || '';
    document.getElementById('gender').value = data.gender || 'prefer-not';
    document.getElementById('location').value = data.location || '';

    // Body Metrics
    document.getElementById('height').value = data.height || '';
    document.getElementById('weight').value = data.currentWeight || '';
    document.getElementById('targetWeight').value = data.targetWeight || '';
    document.getElementById('bodyFat').value = data.bodyFat || '';
    document.getElementById('muscleMass').value = data.muscleMass || '';

    // Avatar
    const avatarDisplay = document.getElementById('avatarDisplay');
    const avatarInitials = document.getElementById('avatarInitials');
    
    if (data.avatar) {
        avatarDisplay.style.backgroundImage = `url(${data.avatar})`;
        avatarDisplay.style.backgroundSize = 'cover';
        avatarInitials.style.display = 'none';
    } else {
        const initials = getInitials(data.name || 'User');
        avatarInitials.textContent = initials;
    }

    calculateBMI();
}

// Get Initials from Name
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Store Original Data
function storeOriginalData() {
    originalData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        targetWeight: document.getElementById('targetWeight').value,
        bodyFat: document.getElementById('bodyFat').value,
        muscleMass: document.getElementById('muscleMass').value
    };
}

// Toggle Edit Mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const inputs = document.querySelectorAll('.info-item input, .info-item select');
    const actionButtons = document.getElementById('actionButtons');
    const editToggle = document.getElementById('editToggle');

    inputs.forEach(input => {
        if (input.id !== 'email' && input.id !== 'bmi') {
            input.disabled = !isEditMode;
        }
    });

    if (isEditMode) {
        actionButtons.style.display = 'flex';
        editToggle.style.background = 'var(--accent-primary)';
        showNotification('Edit mode enabled', 'info');
    } else {
        actionButtons.style.display = 'none';
        editToggle.style.background = '';
    }
}

// Save Profile
async function saveProfile() {
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        // Get values and validate
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const targetWeight = document.getElementById('targetWeight').value;
        
        // Validate required fields
        if (!height || !weight || !targetWeight) {
            showNotification('Please fill in height, current weight, and target weight', 'error');
            return;
        }
        
        const profileData = {
            name: document.getElementById('fullName').value || 'User',
            phone: document.getElementById('phone').value || '',
            dateOfBirth: document.getElementById('dob').value || '',
            gender: document.getElementById('gender').value || 'male',
            location: document.getElementById('location').value || '',
            height: parseFloat(height) || 0,
            currentWeight: parseFloat(weight) || 0,
            targetWeight: parseFloat(targetWeight) || 0,
            bodyFat: parseFloat(document.getElementById('bodyFat').value) || 0,
            muscleMass: parseFloat(document.getElementById('muscleMass').value) || 0
        };
        
        console.log('Sending profile data:', profileData);

        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            showNotification('Profile updated successfully!', 'success');
            storeOriginalData();
            toggleEditMode();
            
            // Update display name
            document.getElementById('displayName').textContent = profileData.name;
            
            // Recalculate BMI
            calculateBMI();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Failed to save profile', 'error');
    }
}

// Cancel Edit
function cancelEdit() {
    // Restore original data
    document.getElementById('fullName').value = originalData.fullName;
    document.getElementById('phone').value = originalData.phone;
    document.getElementById('dob').value = originalData.dob;
    document.getElementById('gender').value = originalData.gender;
    document.getElementById('location').value = originalData.location;
    document.getElementById('height').value = originalData.height;
    document.getElementById('weight').value = originalData.weight;
    document.getElementById('targetWeight').value = originalData.targetWeight;
    document.getElementById('bodyFat').value = originalData.bodyFat;
    document.getElementById('muscleMass').value = originalData.muscleMass;

    calculateBMI();
    toggleEditMode();
    showNotification('Changes cancelled', 'info');
}

// Handle Avatar Upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const avatarDisplay = document.getElementById('avatarDisplay');
        const avatarInitials = document.getElementById('avatarInitials');
        
        avatarDisplay.style.backgroundImage = `url(${e.target.result})`;
        avatarDisplay.style.backgroundSize = 'cover';
        avatarInitials.style.display = 'none';

        // Upload to server
        await uploadAvatar(file);
    };
    reader.readAsDataURL(file);
}

// Upload Avatar to Server
async function uploadAvatar(file) {
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/user/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            showNotification('Avatar updated successfully!', 'success');
        } else {
            showNotification('Failed to upload avatar', 'error');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        showNotification('Failed to upload avatar', 'error');
    }
}

// Calculate BMI
function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const bmiInput = document.getElementById('bmi');

    if (height && weight && height > 0) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        
        let category = '';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';

        bmiInput.value = `${bmi} (${category})`;
    } else {
        bmiInput.value = '';
    }
}

// Edit Preference
function editPreference(type) {
    showNotification(`Edit ${type} feature coming soon!`, 'info');
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        const isAdmin = localStorage.getItem('adminToken');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        if (isAdmin) {
            window.location.href = 'admin-login.html';
        } else {
            window.location.href = 'login.html';
        }
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
