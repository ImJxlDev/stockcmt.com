class AdminAuthSystem {
    constructor() {
        // More secure way of storing admin credentials
        this.ADMIN_CREDENTIALS = [
            {
                username: 'admin',
                password: 'VertexAdmin2024!', // Consider using a more complex password
                role: 'superadmin'
            },
            {
                username: 'support',
                password: 'SupportTeam2024!',
                role: 'support'
            }
        ];
        this.initializeDOM();
    }

    initializeDOM() {
        this.loginContainer = document.getElementById('login-container');
        this.adminDashboard = document.getElementById('admin-dashboard');
        this.loginForm = document.getElementById('login-form');
        this.loginError = document.getElementById('login-error');
        this.logoutBtn = document.getElementById('logout-btn');

        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const admin = this.ADMIN_CREDENTIALS.find(
            admin => admin.username === username && admin.password === password
        );

        if (admin) {
            // Store login state (you might want to use more secure methods in production)
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            sessionStorage.setItem('adminRole', admin.role);

            window.location.href = 'admin-dashboard.html';
        } else {
            this.showLoginError('Invalid credentials. Please try again.');
        }
    }

    handleLogout() {
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('adminRole');
        window.location.href = 'admin-login.html';
    }

    showLoginError(message) {
        if (this.loginError) this.loginError.textContent = message;
    }

    // Check if admin is logged in
    isAdminLoggedIn() {
        return sessionStorage.getItem('isAdminLoggedIn') === 'true';
    }

    // Get current admin role
    getAdminRole() {
        return sessionStorage.getItem('adminRole');
    }
}

// Initialize admin authentication
document.addEventListener('DOMContentLoaded', () => {
    const adminAuth = new AdminAuthSystem();

    // Protect admin dashboard routes
    if (window.location.pathname.includes('admin-dashboard.html')) {
        if (!adminAuth.isAdminLoggedIn()) {
            window.location.href = 'admin-login.html'; // Redirect to login if not authenticated
        }
    }
});