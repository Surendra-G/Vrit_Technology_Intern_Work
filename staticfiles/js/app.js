// Utility function to get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Utility function to show alerts
function showAlert(message, type = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    updateAuthState(token);

    // Set CSRF tokens
    document.querySelector('#csrf_token_login').value = getCookie('csrftoken');
    document.querySelector('#csrf_token_register').value = getCookie('csrftoken');
    document.querySelector('#csrf_token_transaction').value = getCookie('csrftoken');

    // Event Listeners
    document.getElementById('login-btn').addEventListener('click', showLoginForm);
    document.getElementById('register-btn').addEventListener('click', showRegisterForm);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('login-form-submit').addEventListener('submit', handleLogin);
    document.getElementById('register-form-submit').addEventListener('submit', handleRegister);
    document.getElementById('transaction-form').addEventListener('submit', handleTransaction);

    if (token) {
        fetchTransactions();
        fetchSummary();
    }
});

// Authentication state management
function updateAuthState(token) {
    const isAuthenticated = !!token;
    document.getElementById('login-btn').style.display = isAuthenticated ? 'none' : 'block';
    document.getElementById('register-btn').style.display = isAuthenticated ? 'none' : 'block';
    document.getElementById('logout-btn').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('app-content').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('auth-forms').style.display = isAuthenticated ? 'none' : 'block';
    
    if (isAuthenticated) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('username-display').style.display = 'block';
        document.getElementById('username-display').textContent = payload.username;
    } else {
        document.getElementById('username-display').style.display = 'none';
    }
}

// Form display functions
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

// Authentication handlers
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const csrfToken = document.getElementById('csrf_token_login').value;

    try {
        const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            updateAuthState(data.access);
            fetchTransactions();
            fetchSummary();
            document.getElementById('login-form-submit').reset();
            showAlert('Login successful!', 'success');
        } else {
            showAlert(data.detail || 'Login failed');
        }
    } catch (error) {
        showAlert('An error occurred during login');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const csrfToken = document.getElementById('csrf_token_register').value;

    try {
        const response = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Registration successful! Please login.', 'success');
            showLoginForm();
            document.getElementById('register-form-submit').reset();
        } else {
            showAlert(data.username?.[0] || 'Registration failed');
        }
    } catch (error) {
        showAlert('An error occurred during registration');
    }
}

function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    updateAuthState(null);
    document.getElementById('transactions-list').innerHTML = '';
    showAlert('Logged out successfully', 'success');
}

// Transaction handlers
async function handleTransaction(e) {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
        showAlert('Please login first');
        return;
    }

    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        transaction_type: document.querySelector('input[name="transaction_type"]:checked').value,
        tax: parseFloat(document.getElementById('tax').value) || 0,
        tax_type: document.querySelector('input[name="tax_type"]:checked').value
    };

    try {
        const response = await fetch('/api/expenses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('transaction-form').reset();
            fetchTransactions();
            fetchSummary();
            showAlert('Transaction added successfully!', 'success');
        } else if (response.status === 401) {
            await refreshToken();
            handleTransaction(e); // Retry after token refresh
        } else {
            const data = await response.json();
            showAlert(data.detail || 'Failed to add transaction');
        }
    } catch (error) {
        showAlert('An error occurred while adding transaction');
    }
}

// Token refresh
async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        handleLogout();
        return;
    }

    try {
        const response = await fetch('/api/auth/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        } else {
            handleLogout();
            return false;
        }
    } catch (error) {
        handleLogout();
        return false;
    }
}

// Fetch and render transactions
async function fetchTransactions(page = 1) {
    const token = localStorage.getItem('access_token');
    console.log("AccessToken: ",token);
    if (!token) return;

    document.getElementById('loading').style.display = 'block';
    try {
        const response = await fetch(`/api/expenses/?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            renderTransactions(data.results);
            renderPagination(data);
        } else if (response.status === 401) {
            await refreshToken();
            fetchTransactions(page); // Retry after token refresh
        }
    } catch (error) {
        showAlert('Error fetching transactions');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function renderTransactions(transactions) {
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = '';

    transactions.forEach(transaction => {
        const card = document.createElement('div');
        card.className = `card transaction-card ${transaction.transaction_type}`;
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${transaction.title}</h5>
                <p class="card-text">${transaction.description || 'No description'}</p>
                <p class="card-text">Amount: $${transaction.amount.toFixed(2)}</p>
                <p class="card-text">Tax: ${transaction.tax_type === 'percentage' ? `${transaction.tax}%` : `$${transaction.tax}`}</p>
                <p class="card-text">Total: $${transaction.total.toFixed(2)}</p>
                <p class="card-text"><small class="text-muted">Created: ${new Date(transaction.created_at).toLocaleString()}</small></p>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${transaction.id}">Delete</button>
            </div>
        `;
        transactionsList.appendChild(card);
    });

    // Add delete button listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDelete(btn.dataset.id));
    });
}

// Pagination
function renderPagination(data) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (data.previous) {
        const prev = document.createElement('li');
        prev.className = 'page-item';
        prev.innerHTML = `<a class="page-link" href="#" data-page="${parseInt(data.current_page) - 1}">Previous</a>`;
        pagination.appendChild(prev);
    }

    for (let i = 1; i <= data.total_pages; i++) {
        const page = document.createElement('li');
        page.className = `page-item ${i === data.current_page ? 'active' : ''}`;
        page.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        pagination.appendChild(page);
    }

    if (data.next) {
        const next = document.createElement('li');
        next.className = 'page-item';
        next.innerHTML = `<a class="page-link" href="#" data-page="${parseInt(data.current_page) + 1}">Next</a>`;
        pagination.appendChild(next);
    }

    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            fetchTransactions(e.target.dataset.page);
        });
    });
}

// Delete transaction
async function handleDelete(id) {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const response = await fetch(`/api/expenses/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (response.ok) {
            fetchTransactions();
            fetchSummary();
            showAlert('Transaction deleted successfully', 'success');
        } else if (response.status === 401) {
            await refreshToken();
            handleDelete(id); // Retry after token refresh
        } else {
            showAlert('Failed to delete transaction');
        }
    } catch (error) {
        showAlert('Error deleting transaction');
    }
}

// Fetch and render summary
async function fetchSummary() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const response = await fetch('/api/expenses/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const summary = data.results.reduce((acc, curr) => {
                const total = parseFloat(curr.total);
                if (curr.transaction_type === 'credit') {
                    acc.income += total;
                } else {
                    acc.expense += total;
                }
                return acc;
            }, { income: 0, expense: 0 });

            document.getElementById('total-income').textContent = `$${summary.income.toFixed(2)}`;
            document.getElementById('total-expense').textContent = `$${summary.expense.toFixed(2)}`;
            document.getElementById('net-balance').textContent = `$${(summary.income - summary.expense).toFixed(2)}`;
        }
    } catch (error) {
        showAlert('Error fetching summary');
    }
}