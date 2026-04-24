const API_URL = '/api';

// Shared function for handling auth response
function handleAuthSuccess(result) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('userId', result.userId);
    
    // If inside an iframe (drawer), navigate the parent
    if (window.self !== window.top) {
        window.parent.location.href = 'dashboard-v2.html';
    } else {
        window.location.href = 'dashboard-v2.html';
    }
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'AUTHENTICATING...';
        submitBtn.disabled = true;
        
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                submitBtn.textContent = 'ACCESS GRANTED';
                submitBtn.style.background = '#10b981';
                handleAuthSuccess(result);
            } else {
                alert(result.message || 'Login failed');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Connection failed. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'ESTABLISHING PROFILE...';
        submitBtn.disabled = true;
        
        const formData = new FormData(registerForm);
        const rawData = Object.fromEntries(formData.entries());
        
        // Simplified mapping for the tactical form
        const nameParts = (rawData.fullName || 'User').split(' ');
        const data = {
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' ') || '',
            email: rawData.email,
            password: rawData.password,
            // Defaults for registration
            gender: 'other',
            age: 25,
            height: 170,
            weight: 70,
            goalWeight: 65,
            activityLevel: 'moderate',
            fitnessGoal: 'maintain'
        };
        
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                submitBtn.textContent = 'WELCOME TO THE COLLECTIVE';
                submitBtn.style.background = '#10b981';
                handleAuthSuccess(result);
            } else {
                alert(result.message || 'Registration failed');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Connection failed. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
