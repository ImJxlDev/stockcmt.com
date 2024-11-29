// Admin Credentials (in a real-world scenario, use secure backend authentication)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'VertexAdmin2024!';

// DOM Elements
const loginContainer = document.getElementById('login-container');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// Login Handler
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        loginContainer.style.display = 'none';
        adminDashboard.style.display = 'block';
        loginError.textContent = '';
    } else {
        loginError.textContent = 'Invalid credentials. Please try again.';
    }
});

// Logout Handler
logoutBtn.addEventListener('click', function() {
    adminDashboard.style.display = 'none';
    loginContainer.style.display = 'block';
    // Clear input fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

// Update Functions
function updateAccountBalance() {
    const balanceInput = document.getElementById('account-balance');
    const newBalance = balanceInput.value;
    
    // In a real app, this would update the backend
    document.querySelector('.acc-number').textContent = `${newBalance} $`;
    balanceInput.value = ''; // Clear input
    alert('Account balance updated successfully!');
}

function updateReferralLink() {
    const referralInput = document.getElementById('referral-link');
    const newLink = referralInput.value;
    
    // In a real app, this would update the backend
    document.getElementById('refer-link').value = newLink;
    referralInput.value = ''; // Clear input
    alert('Referral link updated successfully!');
}

function updateFinancialMetrics() {
    const withdrawInput = document.getElementById('total-withdraw');
    const depositInput = document.getElementById('total-deposit');
    const investInput = document.getElementById('total-invest');

    // Update total sections in the original dashboard
    document.querySelectorAll('.d-box-three .title').forEach((el, index) => {
        switch(index) {
            case 0: el.textContent = `${withdrawInput.value} $`; break;
            case 1: el.textContent = `${depositInput.value} $`; break;
            case 2: el.textContent = `${investInput.value} $`; break;
        }
    });

    // Clear inputs
    withdrawInput.value = '';
    depositInput.value = '';
    investInput.value = '';

    alert('Financial metrics updated successfully!');
}
// Extend the existing EnhancedAuthSystem in auth.js with additional admin user management methods
class EnhancedAdminUserManagement extends EnhancedAuthSystem {
    // Render user list in the admin dashboard
    renderUserList() {
        if (!this.isAdmin()) {
            alert('Unauthorized access');
            return;
        }

        // Get the container for user list
        const userListContainer = document.getElementById('admin-user-list');
        if (!userListContainer) return;

        // Clear existing content
        userListContainer.innerHTML = '';

        // Get all users
        const users = this.getAllUsers();

        // Create table to display users
        const table = document.createElement('table');
        table.className = 'table table-striped table-hover';
        
        // Table header
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Created At</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="user-list-body"></tbody>
        `;

        const tbody = table.querySelector('tbody');

        // Populate table with users
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.country}</td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-user" data-user-id="${user.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-user" data-user-id="${user.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        userListContainer.appendChild(table);

        // Add event listeners for edit and delete buttons
        this.setupUserManagementListeners();
    }

    // Setup event listeners for user management actions
    setupUserManagementListeners() {
        const userListBody = document.getElementById('user-list-body');
        if (!userListBody) return;

        // Edit user handler
        userListBody.addEventListener('click', (event) => {
            const editButton = event.target.closest('.edit-user');
            if (editButton) {
                const userId = editButton.getAttribute('data-user-id');
                this.showUserEditModal(userId);
            }
        });

        // Delete user handler
        userListBody.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.delete-user');
            if (deleteButton) {
                const userId = deleteButton.getAttribute('data-user-id');
                this.deleteUser(userId);
            }
        });
    }

    // Show modal for editing user details
    showUserEditModal(userId) {
        if (!this.isAdmin()) {
            alert('Unauthorized access');
            return;
        }

        const user = this.users.find(u => u.id === userId);
        if (!user) {
            alert('User not found');
            return;
        }

        // Create or get edit modal
        let modal = document.getElementById('userEditModal');
        if (!modal) {
            modal = this.createUserEditModal();
        }

        // Populate modal with user details
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-first-name').value = user.firstName;
        document.getElementById('edit-last-name').value = user.lastName;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-country').value = user.country || '';
        document.getElementById('edit-currency').value = user.currency || '';

        // Show modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    // Create user edit modal HTML
    createUserEditModal() {
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = `
            <div class="modal fade" id="userEditModal" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit User</h5>
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-user-form">
                                <input type="hidden" id="edit-user-id">
                                <div class="form-group">
                                    <label>First Name</label>
                                    <input type="text" class="form-control" id="edit-first-name" required>
                                </div>
                                <div class="form-group">
                                    <label>Last Name</label>
                                    <input type="text" class="form-control" id="edit-last-name" required>
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" class="form-control" id="edit-email" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Phone</label>
                                    <input type="tel" class="form-control" id="edit-phone">
                                </div>
                                <div class="form-group">
                                    <label>Country</label>
                                    <input type="text" class="form-control" id="edit-country">
                                </div>
                                <div class="form-group">
                                    <label>Currency</label>
                                    <input type="text" class="form-control" id="edit-currency">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="save-user-changes">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        // Add save changes event listener
        document.getElementById('save-user-changes').addEventListener('click', () => {
            const userId = document.getElementById('edit-user-id').value;
            const updateData = {
                firstName: document.getElementById('edit-first-name').value,
                lastName: document.getElementById('edit-last-name').value,
                phone: document.getElementById('edit-phone').value,
                country: document.getElementById('edit-country').value,
                currency: document.getElementById('edit-currency').value
            };

            try {
                this.updateUserByAdmin(userId, updateData);
                alert('User updated successfully');
                
                // Refresh user list
                this.renderUserList();

                // Close modal
                const modal = document.getElementById('userEditModal');
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                bootstrapModal.hide();
            } catch (error) {
                alert(error.message);
            }
        });

        return modalDiv.querySelector('.modal');
    }

    // Delete a user
    deleteUser(userId) {
        if (!this.isAdmin()) {
            alert('Unauthorized access');
            return;
        }

        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                // Remove user from the array
                const userIndex = this.users.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    this.users.splice(userIndex, 1);
                    this.saveUsers();
                    
                    // Refresh user list
                    this.renderUserList();
                    
                    alert('User deleted successfully');
                } else {
                    alert('User not found');
                }
            } catch (error) {
                alert('Error deleting user: ' + error.message);
            }
        }
    }
}

// Update the auth initialization to use the extended class
const auth = new EnhancedAdminUserManagement();