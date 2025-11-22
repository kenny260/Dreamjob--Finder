// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const updateApiKey = document.getElementById('updateApiKey');
const searchBtn = document.getElementById('searchBtn');
const filterToggle = document.getElementById('filterToggle');
const advancedFilters = document.getElementById('advancedFilters');
const loadingState = document.getElementById('loadingState');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const emptyState = document.getElementById('emptyState');
const jobsList = document.getElementById('jobsList');
const resultsCount = document.getElementById('resultsCount');
const loginError = document.getElementById('loginError');

// Get API key from config or localStorage
let currentApiKey = localStorage.getItem('jobSearchApiKey') || API_CONFIG.DEFAULT_API_KEY;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login event listeners
    loginBtn.addEventListener('click', handleLogin);
    document.getElementById('username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Main app event listeners
    logoutBtn.addEventListener('click', handleLogout);
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        document.getElementById('apiKeyInput').value = currentApiKey;
    });
    closeModal.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('hidden');
    });
    updateApiKey.addEventListener('click', handleUpdateApiKey);
    searchBtn.addEventListener('click', handleSearch);
    filterToggle.addEventListener('click', toggleFilters);

    // Search on Enter key
    document.getElementById('searchTerm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    document.getElementById('location').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Close modal on outside click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });
});

// Authentication Functions
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        loginError.textContent = '';
        loginError.classList.remove('show');
    } else {
        loginError.textContent = 'Invalid credentials. Use demo/demo123';
        loginError.classList.add('show');
    }
}

function handleLogout() {
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    resetSearchResults();
}

// API Key Management
function handleUpdateApiKey() {
    const newApiKey = document.getElementById('apiKeyInput').value.trim();
    if (newApiKey) {
        currentApiKey = newApiKey;
        localStorage.setItem('jobSearchApiKey', newApiKey);
        settingsModal.classList.add('hidden');
        showNotification('API Key updated successfully!', 'success');
    } else {
        showNotification('Please enter a valid API key', 'error');
    }
}

// Search Functions
function toggleFilters() {
    advancedFilters.classList.toggle('hidden');
    const icon = filterToggle.querySelector('i');
    const text = filterToggle.querySelector('span');
    
    if (advancedFilters.classList.contains('hidden')) {
        text.textContent = 'Advanced Filters';
    } else {
        text.textContent = 'Hide Filters';
    }
}

async function handleSearch() {
    const searchTerm = document.getElementById('searchTerm').value.trim();
    const location = document.getElementById('location').value.trim();
    const jobType = document.getElementById('jobType').value;
    const distance = parseInt(document.getElementById('distance').value);
    const resultsWanted = parseInt(document.getElementById('resultsWanted').value);
    const isRemote = document.getElementById('isRemote').checked;

    // Validation
    if (!searchTerm) {
        showError('Please enter a job title or keyword');
        return;
    }

    // Show loading state
    showLoading();
    hideError();
    hideResults();

    // Prepare request
    const url = API_CONFIG.BASE_URL;
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': currentApiKey,
            'x-rapidapi-host': API_CONFIG.RAPID_API_HOST,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            search_term: searchTerm,
            location: location || 'United States',
            results_wanted: resultsWanted,
            site_name: ['indeed', 'linkedin', 'zip_recruiter', 'glassdoor'],
            distance: distance,
            job_type: jobType,
            is_remote: isRemote,
            hours_old: 168
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        hideLoading();

        if (response.ok && data.jobs) {
            if (data.jobs.length === 0) {
                showError('No jobs found. Try adjusting your search criteria.');
            } else {
                displayResults(data.jobs);
            }
        } else {
            showError(data.message || 'Failed to fetch jobs. Please check your API key in settings.');
        }
    } catch (error) {
        hideLoading();
        showError('Network error. Please try again later.');
        console.error('Search error:', error);
    }
}

// Display Functions
function displayResults(jobs) {
    jobsList.innerHTML = '';
    resultsCount.textContent = jobs.length;
    
    jobs.forEach(job => {
        const jobCard = createJobCard(job);
        jobsList.appendChild(jobCard);
    });

    resultsSection.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';

    const jobHeader = `
        <div class="job-header">
            <div>
                <h3 class="job-title">${escapeHtml(job.title || 'N/A')}</h3>
                <div class="job-meta">
                    <div class="job-meta-item">
                        <i class="fas fa-building"></i>
                        <span>${escapeHtml(job.company || 'N/A')}</span>
                    </div>
                    <div class="job-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(job.location || 'N/A')}</span>
                    </div>
                    ${job.date_posted ? `
                        <div class="job-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${escapeHtml(job.date_posted)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <span class="job-badge">${escapeHtml(job.site || 'N/A')}</span>
        </div>
    `;

    const jobDescription = job.description ? `
        <p class="job-description">${escapeHtml(job.description)}</p>
    ` : '';

    const jobFooter = `
        <div class="job-footer">
            <div class="job-tags">
                ${job.job_type ? `<span class="job-tag">${escapeHtml(job.job_type)}</span>` : ''}
                ${job.is_remote ? `<span class="job-tag remote">Remote</span>` : ''}
            </div>
            ${job.job_url ? `
                <a href="${escapeHtml(job.job_url)}" target="_blank" rel="noopener noreferrer" class="btn-apply">
                    <span>Apply Now</span>
                    <i class="fas fa-external-link-alt"></i>
                </a>
            ` : ''}
        </div>
    `;

    card.innerHTML = jobHeader + jobDescription + jobFooter;
    return card;
}

// UI State Functions
function showLoading() {
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    emptyState.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showResults() {
    resultsSection.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

function resetSearchResults() {
    jobsList.innerHTML = '';
    resultsSection.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
    document.getElementById('searchTerm').value = '';
    document.getElementById('location').value = '';
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px var(--shadow);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility Functions
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Add CSS animations
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
