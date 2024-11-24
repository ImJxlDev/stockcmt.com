class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.initializeEventListeners();
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
                        alert(`Welcome back, ${user.firstName}!`);
                        window.location.href = '/demo/dashboard.html';
                    } catch (error) {
                        alert(error.message);
                    }
                });
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
                        alert('Registration successful! Please login.');
                        window.location.href = '../dashboard/production/login.html';
                    } catch (error) {
                        alert(error.message);
                    }
                });
            }

            // Initialize dashboard protection and updates
            this.protectDashboard();
            this.updateDashboard();
        });
    }

    register(userData) {
        // Validate email doesn't already exist
        if (this.users.find(user => user.email === userData.email)) {
            throw new Error('Email already registered');
        }

        // Password validation
        if (userData.password !== userData.cpassword) {
            throw new Error('Passwords do not match');
        }
        if (userData.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Create user object with all form fields
        const user = {
            id: Date.now(),
            firstName: userData.fname,
            lastName: userData.lname,
            email: userData.email,
            phone: userData.phone,
            dob: userData.dob,
            country: userData.country,
            currency: userData.currency,
            password: this.hashPassword(userData.password),
            createdAt: new Date().toISOString()
        };

        this.users.push(user);
        this.saveUsers();
        return user;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email);
        
        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('Invalid email or password');
        }

        this.currentUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            currency: user.currency
        };

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = '../dashboard/production/login.html';
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hashPassword(password) {
        // In production, use a proper hashing library
        return btoa(password);
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    protectDashboard() {
        const isLoginPage = window.location.href.includes('login.html');
        const isRegisterPage = window.location.href.includes('register');
        
        if (!this.isLoggedIn() && !isLoginPage && !isRegisterPage) {
            window.location.href = '../dashboard/production/login.html';
        }
    }

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
}

// Initialize auth system
const auth = new AuthSystem();