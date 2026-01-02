// State Management
const state = {
    currentEmail: localStorage.getItem('currentEmail') || '',
    token: localStorage.getItem('token') || '',
    createdAt: localStorage.getItem('createdAt') || '',
    mails: [],
    selectedDomain: 'teleflix.online',
    socket: null,
    isDarkMode: localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Theme
    if (state.isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
    }

    // 2. Render Icons
    if (window.lucide) lucide.createIcons();

    // 3. Setup Event Listeners
    setupEventListeners();

    // 4. Restore Session or Create New
    const existingAddress = localStorage.getItem('currentEmail');
    if (existingAddress) {
        state.currentEmail = existingAddress;
        updateEmailDisplay();

        // Restore/Check token valid
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            api.setJwt(savedToken);
            await fetchMails();
            setupRealtimeUpdates();
        } else {
            // Token missing but email exists? edge case, regenerate
            createNewAddress();
        }
    } else {
        createNewAddress();
    }
});

function setupEventListeners() {
    const newAddrBtn = document.getElementById('new-address-btn');
    if (newAddrBtn) newAddrBtn.addEventListener('click', () => createNewAddress());

    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);

    // Mobile Detail View Close
    const closeDetailBtn = document.getElementById('close-detail-btn');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            document.body.classList.remove('viewing-detail');
            // Clear selection visual
            document.querySelectorAll('.email-item').forEach(el => el.classList.remove('selected'));
        });
    }

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    const themeIcon = document.getElementById('theme-icon');

    if (state.isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
    } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
    }
    if (window.lucide) lucide.createIcons();
}

async function fetchMails() {
    try {
        const mails = await api.getMails();
        state.mails = mails;
        ui.renderInbox(mails, onEmailSelect); // Pass click handler

        // Update helper badge
        const countBadge = document.getElementById('email-count');
        if (countBadge) countBadge.textContent = `${mails.length} messages`;

    } catch (error) {
        console.error('Failed to fetch mails:', error);
    }
}

// Handler for when an email is clicked in the list
function onEmailSelect(mailId) {
    const mail = state.mails.find(m => m.id === mailId);
    if (!mail) return;

    // 1. Mark UI selected
    document.querySelectorAll('.email-item').forEach(el => el.classList.remove('selected'));
    const selectedEl = document.querySelector(`[data-id="${mailId}"]`);
    if (selectedEl) selectedEl.classList.add('selected');

    // 2. Show Detail View
    ui.renderEmailDetail(mail);

    // 3. Mobile Logic
    document.body.classList.add('viewing-detail');
}

async function createNewAddress(domain) {
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) statusIndicator.classList.add('is-loading'); // Yellow

    try {
        const data = await api.createAddress(domain || state.selectedDomain);
        state.currentEmail = data.address;
        localStorage.setItem('currentEmail', data.address);

        // Update UI
        updateEmailDisplay();

        // Clear Inbox
        state.mails = [];
        ui.renderInbox([], onEmailSelect);
        ui.clearDetailView(); // user defined function to reset right pane

        setupRealtimeUpdates();

    } catch (error) {
        console.error("Create Address Error", error);
        alert("Could not generate email.");
    } finally {
        if (statusIndicator) statusIndicator.classList.remove('is-loading');
    }
}

function updateEmailDisplay() {
    const emailInput = document.getElementById('email-address');
    if (emailInput) emailInput.value = state.currentEmail;
}

function copyToClipboard() {
    const email = state.currentEmail;
    if (!email) return;

    navigator.clipboard.writeText(email).then(() => {
        const btnText = document.getElementById('copy-text');
        if (!btnText) return;

        const originalText = btnText.textContent;
        btnText.textContent = 'Copied!';
        setTimeout(() => btnText.textContent = originalText, 2000);
    });
}

function setupRealtimeUpdates() {
    if (state.socket) state.socket.disconnect();

    const address = state.currentEmail;
    if (!address) return;

    try {
        state.socket = io('https://swiftmail-pusher.onrender.com');
        state.socket.on('connect', () => {
            console.log('Connected to socket');
            state.socket.emit('join', address);
        });

        state.socket.on('new_email', () => {
            console.log('New Email Notification!');
            fetchMails(); // Refresh inbox
        });

    } catch (e) {
        console.error("Socket error", e);
    }
}
