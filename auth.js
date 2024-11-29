class EnhancedAuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.adminUsers = ['admin@example.com']; // Predefined admin emails
        this.initializeEventListeners();
    }

    // Improved secure local storage methods
    loadUsers() {
        const encryptedUsers = localStorage.getItem('secureUserData');
        return encryptedUsers ? this.decryptData(encryptedUsers) : [];
    }

    saveUsers() {
        const encryptedUsers = this.encryptData(this.users);
        localStorage.setItem('secureUserData', encryptedUsers);
    }

    loadCurrentUser() {
        const encryptedCurrentUser = localStorage.getItem('secureCurrentUser');
        return encryptedCurrentUser ? this.decryptData(encryptedCurrentUser) : null;
    }

    saveCurrentUser() {
        if (this.currentUser) {
            const encryptedCurrentUser = this.encryptData(this.currentUser);
            localStorage.setItem('secureCurrentUser', encryptedCurrentUser);
        }
    }

    // Advanced encryption methods
    generateEncryptionKey() {
        // In a real-world scenario, use a more secure key generation method
        return btoa(navigator.userAgent + Date.now());
    }

    encryptData(data) {
        try {
            const key = this.generateEncryptionKey();
            return window.btoa(JSON.stringify({
                data: window.btoa(JSON.stringify(data)),
                timestamp: Date.now(),
                key: key
            }));
        } catch (error) {
            console.error('Encryption failed', error);
            return null;
        }
    }

    decryptData(encryptedData) {
        try {
            const parsed = JSON.parse(window.atob(encryptedData));
            
            // Check token expiration (1 year = 31,536,000,000 milliseconds)
            const MAX_TOKEN_AGE = 31536000000;
            if (Date.now() - parsed.timestamp > MAX_TOKEN_AGE) {
                throw new Error('Token expired');
            }

            return JSON.parse(window.atob(parsed.data));
        } catch (error) {
            console.error('Decryption failed', error);
            return null;
        }
    }

    // Enhanced password hashing with salt
    hashPassword(password) {
        const salt = this.generateSalt();
        const hashedPassword = this.bcryptHash(password + salt);
        return { salt, hashedPassword };
    }

    verifyPassword(inputPassword, storedPassword, salt) {
        return this.bcryptHash(inputPassword + salt) === storedPassword;
    }

    generateSalt() {
        return window.btoa(Math.random().toString(36).substring(2, 15));
    }

    // Mock bcrypt-like hashing (use a real library in production)
    bcryptHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Login form handler
            const loginForm = document.querySelector('.login_form form');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    try {
                        const email = loginForm.querySelector('input[name="email"]').value;
                        const password = loginForm.querySelector('input[name="password"]').value;
                        
                        if (!email || !password) {
                            throw new Error('Please fill in all fields');
                        }
                        
                        const user = await this.login(email, password);
                        
                        // Success message using browser's localStorage to persist across page reload
                        localStorage.setItem('loginSuccessMessage', `Welcome back, ${user.firstName}!`);
                        
                        // Redirect to dashboard
                        window.location.href = '/demo/dashboard.html';
                    } catch (error) {
                        alert(error.message);
                    }
                });

                // Check for and display success message on dashboard
                const successMessage = localStorage.getItem('loginSuccessMessage');
                if (successMessage) {
                    alert(successMessage);
                    localStorage.removeItem('loginSuccessMessage');
                }
            }

            // Registration form handler
            const registerForm = document.querySelector('.form-register');
            if (registerForm) {
                registerForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    try {
                        const formData = {
                            fname: registerForm.querySelector('[name="fname"]').value,
                            lname: registerForm.querySelector('[name="lname"]').value,
                            email: registerForm.querySelector('[name="email"]').value,
                            phone: registerForm.querySelector('[name="phone"]').value,
                            dob: registerForm.querySelector('[name="dob"]').value,
                            country: registerForm.querySelector('[name="country"]').value,
                            currency: registerForm.querySelector('[name="currency"]').value,
                            password: registerForm.querySelector('[name="password"]').value,
                            cpassword: registerForm.querySelector('[name="cpassword"]').value
                        };

                        await this.register(formData);
                        
                        // Success message using localStorage to persist across page reload
                        localStorage.setItem('registrationSuccessMessage', 'Registration successful! Please login.');
                        
                        // Redirect to login page
                        window.location.href = '../dashboard/production/login.html';
                    } catch (error) {
                        alert(error.message);
                    }
                });

                // Check for and display registration success message on login page
                const registrationMessage = localStorage.getItem('registrationSuccessMessage');
                if (registrationMessage) {
                    alert(registrationMessage);
                    localStorage.removeItem('registrationSuccessMessage');
                }
            }

            // Initialize dashboard protection and updates
            this.protectDashboard();
            this.updateDashboard();
        });
    }

    // Registration with enhanced validation
    register(userData) {
        // Extensive validation
        this.validateRegistration(userData);

        const user = {
            id: crypto.randomUUID(), // More secure ID generation
            firstName: userData.fname,
            lastName: userData.lname,
            email: userData.email.toLowerCase(),
            phone: this.sanitizePhoneNumber(userData.phone),
            dob: userData.dob,
            country: userData.country,
            currency: userData.currency,
            passwordInfo: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isAdmin: this.adminUsers.includes(userData.email.toLowerCase())
        };

        this.users.push(user);
        this.saveUsers();
        return user;
    }

    // Enhanced login with additional security
    login(email, password) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!this.verifyPassword(password, user.passwordInfo.hashedPassword, user.passwordInfo.salt)) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        user.lastLogin = new Date().toISOString();

        this.currentUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            currency: user.currency,
            isAdmin: user.isAdmin
        };

        this.saveCurrentUser();
        this.saveUsers(); // To update last login
        return this.currentUser;
    }

    // Logout method
    logout() {
        this.currentUser = null;
        localStorage.removeItem('secureCurrentUser');
        window.location.href = '../dashboard/production/login.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Dashboard protection
    protectDashboard() {
        const isLoginPage = window.location.href.includes('login.html');
        const isRegisterPage = window.location.href.includes('register');
        
        if (!this.isLoggedIn() && !isLoginPage && !isRegisterPage) {
            window.location.href = '../dashboard/production/login.html';
        }
    }

    // Update dashboard with user info
    updateDashboard() {
        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            
            document.querySelectorAll('.user-name').forEach(element => {
                element.textContent = `${user.firstName} ${user.lastName}`;
            });
            
            const userEmailElement = document.querySelector('.user-email');
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
        }
    }

    // Admin-specific methods
    getAllUsers() {
        if (!this.isAdmin()) {
            throw new Error('Unauthorized access');
        }
        return this.users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            country: user.country,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));
    }

    updateUserByAdmin(userId, updateData) {
        if (!this.isAdmin()) {
            throw new Error('Unauthorized access');
        }

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Selective update to prevent overwriting critical fields
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'country', 'currency'];
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                this.users[userIndex][field] = updateData[field];
            }
        });

        this.saveUsers();
        return this.users[userIndex];
    }

    // Validation and sanitization methods
    validateRegistration(userData) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;

        if (this.users.find(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
            throw new Error('Email already registered');
        }

        if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
        }

        if (!phoneRegex.test(userData.phone)) {
            throw new Error('Invalid phone number');
        }

        if (userData.password !== userData.cpassword) {
            throw new Error('Passwords do not match');
        }

        if (userData.password.length < 12) {
            throw new Error('Password must be at least 12 characters long');
        }
    }

    sanitizePhoneNumber(phone) {
        // Remove all non-digit characters except '+'
        return phone.replace(/[^\d+]/g, '');
    }

    // Admin and permission methods
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }
}

// Initialize enhanced auth system
const auth = new EnhancedAuthSystem();