// API Base URL – change if your backend runs elsewhere
const API_BASE_URL = '';

// Store JWT token
let token = localStorage.getItem('token') || null;

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const logoutBtn = document.getElementById('logoutBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');
const profileInfo = document.getElementById('profileInfo');
const accountsList = document.getElementById('accountsList');
const createAccountBtn = document.getElementById('createAccountBtn');

// Transaction elements
const depositCardNumber = document.getElementById('depositCardNumber');
const depositCvv = document.getElementById('depositCvv');
const depositAmount = document.getElementById('depositAmount');
const depositNotes = document.getElementById('depositNotes');
const depositBtn = document.getElementById('depositBtn');
const depositMessage = document.getElementById('depositMessage');

const withdrawCardNumber = document.getElementById('withdrawCardNumber');
const withdrawCvv = document.getElementById('withdrawCvv');
const withdrawAmount = document.getElementById('withdrawAmount');
const withdrawNotes = document.getElementById('withdrawNotes');
const withdrawBtn = document.getElementById('withdrawBtn');
const withdrawMessage = document.getElementById('withdrawMessage');

// Check if user is already logged in (token exists)
if (token) {
    showDashboard();
    loadDashboardData();
} else {
    showAuth();
}

// Toggle between Login and Register forms
showLoginBtn.addEventListener('click', () => {
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    clearAuthMessages();
});

showRegisterBtn.addEventListener('click', () => {
    showRegisterBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    clearAuthMessages();
});

// Clear messages
function clearAuthMessages() {
    loginError.textContent = '';
    registerError.textContent = '';
    registerSuccess.textContent = '';
}

// Register
registerBtn.addEventListener('click', async () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !phone || !password) {
        registerError.textContent = 'All fields are required';
        return;
    }

    registerError.textContent = '';
    registerSuccess.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone })
        });
        const data = await response.json();
        console.log('Registration response:', data);

        if (data.success) {
            registerSuccess.textContent = 'Registration successful! You can now login.';
            document.getElementById('regName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPhone').value = '';
            document.getElementById('regPassword').value = '';
            setTimeout(() => {
                showLoginBtn.click();
            }, 2000);
        } else {
            registerError.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        registerError.textContent = 'Network error. Please try again.';
        console.error(error);
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        loginError.textContent = 'Email and password are required';
        return;
    }

    loginError.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        console.log('Login response:', data);

        if (data.success && data.data) {
            let tokenValue = null;
            if (typeof data.data === 'string') {
                tokenValue = data.data;
            } else if (data.data.token) {
                tokenValue = data.data.token;
            } else if (data.token) {
                tokenValue = data.token;
            }

            if (tokenValue) {
                token = tokenValue;
                localStorage.setItem('token', token);
                showDashboard();
                loadDashboardData();
            } else {
                loginError.textContent = 'Login failed: Unable to extract token';
                console.error('Unexpected token format:', data.data);
            }
        } else {
            loginError.textContent = data.message || 'Invalid credentials';
        }
    } catch (error) {
        loginError.textContent = 'Network error. Please try again.';
        console.error(error);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    showAuth();
    clearDashboard();
});

// Show dashboard, hide auth
function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
}

// Show auth, hide dashboard
function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    clearAuthMessages();
}

// Clear dashboard data
function clearDashboard() {
    profileInfo.innerHTML = '';
    accountsList.innerHTML = '';
}

// Load profile and accounts after login
async function loadDashboardData() {
    await Promise.all([loadProfile(), loadAccounts()]);
}

// Fetch profile
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            displayProfile(data.data);
        } else {
            console.error('Failed to load profile', data);
        }
    } catch (error) {
        console.error('Profile fetch error', error);
    }
}

function displayProfile(user) {
    profileInfo.innerHTML = `
        <div class="info-item"><strong>Name</strong><p>${user.name || ''}</p></div>
        <div class="info-item"><strong>Email</strong><p>${user.email || ''}</p></div>
        <div class="info-item"><strong>Phone</strong><p>${user.phone || ''}</p></div>
        <div class="info-item"><strong>Role</strong><p>${user.role || 'USER'}</p></div>
    `;
}

// Fetch accounts
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            console.log('Accounts data:', data.data); // ← Check this in console
            displayAccounts(data.data);
        } else {
            console.error('Failed to load accounts', data);
        }
    } catch (error) {
        console.error('Accounts fetch error', error);
    }
}

function displayAccounts(accounts) {
    if (!accounts || accounts.length === 0) {
        accountsList.innerHTML = '<p>No accounts yet. Create one!</p>';
        return;
    }

    // Helper to format card number with spaces
    function formatCardNumber(num) {
        if (!num) return '';
        const cleaned = num.replace(/\D/g, '');
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    }

    accountsList.innerHTML = accounts.map(acc => {
        // Handle both camelCase and snake_case
        const cardNumber = acc.cardNumber || acc.card_number || 'N/A';
        const cvv = acc.cvv || 'N/A';
        const balance = acc.balance || 0;
        const id = acc.id || '?';
        return `
            <div class="account-card">
                <strong>Account #${id}</strong>
                <div class="card-number">💳 ${formatCardNumber(cardNumber)}</div>
                <div class="balance">💰 $${balance.toFixed(2)}</div>
                <div class="cvv">CVV: ${cvv}</div>
            </div>
        `;
    }).join('');
}

// Create new account
createAccountBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const data = await response.json();
        if (data.success) {
            await loadAccounts(); // Refresh accounts list
        } else {
            alert('Failed to create account: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        alert('Network error while creating account');
    }
});

// Deposit
depositBtn.addEventListener('click', async () => {
    const card_number = depositCardNumber.value.trim();
    const cvv = depositCvv.value.trim();
    const amount = parseFloat(depositAmount.value);
    const notes = depositNotes.value.trim();

    if (!card_number || !cvv) {
        depositMessage.textContent = 'Card number and CVV are required';
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        depositMessage.textContent = 'Please enter a valid positive amount';
        return;
    }

    depositMessage.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/transaction/deposit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ card_number, cvv, amount, notes })
        });
        const data = await response.json();
        if (data.success) {
            depositMessage.style.color = '#27ae60';
            depositMessage.textContent = 'Deposit successful!';
            depositCardNumber.value = '';
            depositCvv.value = '';
            depositAmount.value = '';
            depositNotes.value = '';
            await loadAccounts();
        } else {
            depositMessage.style.color = '#e74c3c';
            depositMessage.textContent = data.message || 'Deposit failed';
        }
    } catch (error) {
        depositMessage.textContent = 'Network error';
    }
});

// Withdraw
withdrawBtn.addEventListener('click', async () => {
    const card_number = withdrawCardNumber.value.trim();
    const cvv = withdrawCvv.value.trim();
    const amount = parseFloat(withdrawAmount.value);
    const notes = withdrawNotes.value.trim();

    if (!card_number || !cvv) {
        withdrawMessage.textContent = 'Card number and CVV are required';
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        withdrawMessage.textContent = 'Please enter a valid positive amount';
        return;
    }

    withdrawMessage.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/transaction/withdraw`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ card_number, cvv, amount, notes })
        });
        const data = await response.json();
        if (data.success) {
            withdrawMessage.style.color = '#27ae60';
            withdrawMessage.textContent = 'Withdrawal successful!';
            withdrawCardNumber.value = '';
            withdrawCvv.value = '';
            withdrawAmount.value = '';
            withdrawNotes.value = '';
            await loadAccounts();
        } else {
            withdrawMessage.style.color = '#e74c3c';
            withdrawMessage.textContent = data.message || 'Withdrawal failed';
        }
    } catch (error) {
        withdrawMessage.textContent = 'Network error';
    }
});