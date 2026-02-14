// Auth.js - Manejo de autenticación

const API_BASE = '/api';

// Token storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

// Update UI based on auth status
function updateAuthUI() {
    const user = getCurrentUser();
    const loginItem = document.getElementById('loginItem');
    const registerItem = document.getElementById('registerItem');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');

    if (user) {
        // User is logged in
        if (loginItem) loginItem.style.display = 'none';
        if (registerItem) registerItem.style.display = 'none';
        if (userDropdown) {
            userDropdown.style.display = 'block';
            if (userName) userName.textContent = user.nombre;
        }
    } else {
        // User is not logged in
        if (loginItem) loginItem.style.display = 'block';
        if (registerItem) registerItem.style.display = 'block';
        if (userDropdown) userDropdown.style.display = 'none';
    }
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            updateAuthUI();
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// Register function
async function register(nombre, email, password, nivel = 'usuario') {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password, nivel }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            updateAuthUI();
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}

// Logout function
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
    window.location.href = '/';
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.nivel === 'admin';
}

// Redirect if not logged in
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btnText = document.getElementById('loginBtnText');
            const spinner = document.getElementById('loginSpinner');
            const alert = document.getElementById('alert');
            
            // Show loading
            if (btnText) btnText.textContent = 'Iniciando sesión...';
            if (spinner) spinner.style.display = 'inline-block';
            if (alert) alert.style.display = 'none';
            
            const result = await login(email, password);
            
            if (result.success) {
                window.location.href = '/';
            } else {
                // Show error
                if (alert) {
                    alert.textContent = result.error;
                    alert.style.display = 'block';
                }
                if (btnText) btnText.textContent = 'Iniciar Sesión';
                if (spinner) spinner.style.display = 'none';
            }
        });
    }
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const nivel = document.getElementById('nivel').value;
            const btnText = document.getElementById('registerBtnText');
            const spinner = document.getElementById('registerSpinner');
            const alert = document.getElementById('alert');
            
            // Validate passwords match
            if (password !== confirmPassword) {
                if (alert) {
                    alert.textContent = 'Las contraseñas no coinciden';
                    alert.style.display = 'block';
                }
                return;
            }
            
            // Show loading
            if (btnText) btnText.textContent = 'Registrando...';
            if (spinner) spinner.style.display = 'inline-block';
            if (alert) alert.style.display = 'none';
            
            const result = await register(nombre, email, password, nivel);
            
            if (result.success) {
                window.location.href = '/';
            } else {
                // Show error
                if (alert) {
                    alert.textContent = result.error;
                    alert.style.display = 'block';
                }
                if (btnText) btnText.textContent = 'Registrarse';
                if (spinner) spinner.style.display = 'none';
            }
        });
    }
});
