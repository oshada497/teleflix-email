// Main Application Logic
const PUSHER_URL = "https://swiftmail-pusher.onrender.com";

// Global state
const state = {
    currentEmail: null,
    createdAt: null,
    domains: [],
    selectedDomain: null,
    emails: [],
    refreshInterval: null,
    countdownInterval: null,
    countdownInterval: null,
    socket: null
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('WipeMyMail - Initializing...');

    // Load domains
    state.domains = await api.getDomains();
    populateDomainSelect();

    // Check existing session
    const existingEmail = api.getAddress();
    const existingCreatedAt = api.getCreatedAt();

    if (existingEmail) {
        state.currentEmail = existingEmail;
        state.createdAt = existingCreatedAt;
        const domain = existingEmail.split('@')[1];
        if (domain) state.selectedDomain = domain;

        updateEmailDisplay();
        await fetchMails();
        setupRealtimeUpdates();
    } else if (state.domains.length > 0) {
        // Generate first email
        const randomDomain = state.domains[Math.floor(Math.random() * state.domains.length)];
        state.selectedDomain = randomDomain;
        await createNewAddress(randomDomain);
    }

    // Start countdown timer
    startCountdownTimer();

    // Setup auto-refresh on visibility change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            fetchMails();
        }
    });

    // Initialize event listeners
    initEventListeners();
});

// Populate domain selector
function populateDomainSelect() {
    const select = document.getElementById('domain-select');
    select.innerHTML = state.domains.map(d =>
        `<option value="${d}" ${d === state.selectedDomain ? 'selected' : ''}>@${d}</option>`
    ).join('');
}

// Create new email address
async function createNewAddress(domain) {
    const statusIndicator = document.getElementById('status-indicator');
    statusIndicator.classList.add('is-loading');

    try {
        const data = await api.createAddress(domain || state.selectedDomain);
        state.currentEmail = data.address;
        state.createdAt = api.getCreatedAt();

        const domainPart = data.address.split('@')[1];
        if (domainPart) {
            state.selectedDomain = domainPart;
            populateDomainSelect();
        }

        updateEmailDisplay();
        await fetchMails();
        setupRealtimeUpdates();
    } catch (error) {
        console.error('Failed to create address:', error);
        alert('Failed to create email address. Please try again.');
    } finally {
        statusIndicator.classList.remove('is-loading');
    }
}

// Update email display
function updateEmailDisplay() {
    const emailInput = document.getElementById('email-address');
    emailInput.value = state.currentEmail || 'Generating...';
}

// Fetch emails
async function fetchMails() {
    try {
        const mails = await api.getMails();
        state.emails = mails;
        UI.renderEmailList(mails);
    } catch (error) {
        console.error('Failed to fetch mails:', error);
    }
}

// Setup real-time updates using Socket.IO
function setupRealtimeUpdates() {
    // Clean up existing connection
    if (state.socket) {
        state.socket.disconnect();
    }

    // Clear polling if active
    if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
    }

    if (typeof io === 'undefined') {
        console.warn('Socket.IO not loaded. Real-time updates disabled to save costs. Manual refresh required.');
        return;
    }

    try {
        state.socket = io(PUSHER_URL);

        state.socket.on('connect', () => {
            console.log('Connected to real-time updates');
            const address = api.getAddress();
            if (address) {
                state.socket.emit('join', address);
            }
        });

        state.socket.on('new_email', (data) => {
            console.log('New mail notification received!', data);
            // Show notification if supported
            if (Notification.permission === 'granted') {
                new Notification('New Email Received', {
                    body: 'You have a new message',
                    icon: '/favicon.ico'
                });
            }
            fetchMails();
        });

        state.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

    } catch (e) {
        console.error('Socket initialization failed:', e);
    }
}

// Start countdown timer
function startCountdownTimer() {
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }

    state.countdownInterval = setInterval(() => {
        UI.updateCountdown(state.createdAt);
    }, 1000);

    UI.updateCountdown(state.createdAt);
}

// Event Listeners
function initEventListeners() {
    // Copy button
    document.getElementById('copy-btn').addEventListener('click', async () => {
        const success = await UI.copyToClipboard(state.currentEmail);
        const copyText = document.getElementById('copy-text');
        if (success) {
            copyText.textContent = 'Copied!';
            setTimeout(() => {
                copyText.textContent = 'Copy';
            }, 2000);
        }
    });

    // Refresh inbox button
    document.getElementById('refresh-btn').addEventListener('click', async () => {
        UI.setLoading('refresh-btn', true);
        await fetchMails();
        setTimeout(() => UI.setLoading('refresh-btn', false), 500);
    });

    document.getElementById('inbox-refresh-btn').addEventListener('click', async () => {
        UI.setLoading('inbox-refresh-btn', true);
        await fetchMails();
        setTimeout(() => UI.setLoading('inbox-refresh-btn', false), 500);
    });

    // Domain selector
    document.getElementById('domain-select').addEventListener('change', (e) => {
        const newDomain = e.target.value;
        UI.showConfirm(
            'Change Domain?',
            `Are you sure you want to change your domain to @${newDomain}? Your current inbox will be permanently lost.`,
            async () => {
                state.selectedDomain = newDomain;
                await createNewAddress(newDomain);
            }
        );
    });

    // New address button
    document.getElementById('new-address-btn').addEventListener('click', () => {
        UI.showConfirm(
            'Change Email Address?',
            'Are you sure you want to generate a new email address? All emails in your current inbox will be permanently lost.',
            async () => {
                await createNewAddress(state.selectedDomain);
            }
        );
    });

    // QR code button
    document.getElementById('qr-btn').addEventListener('click', () => {
        UI.showQRCode(state.currentEmail);
    });

    // Email item click (event delegation)
    document.getElementById('inbox-list').addEventListener('click', (e) => {
        const emailItem = e.target.closest('.email-item');
        if (emailItem) {
            const index = parseInt(emailItem.dataset.index);
            const email = state.emails[index];
            if (email) {
                UI.showEmailModal(email);
            }
        }
    });

    // Close email modal
    document.getElementById('close-email-modal').addEventListener('click', () => {
        UI.hideModal('email-modal');
    });

    // Close QR modal
    document.getElementById('close-qr-modal').addEventListener('click', () => {
        UI.hideModal('qr-modal');
    });

    // Close modals on overlay click
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') {
            UI.hideAllModals();
        }
    });

    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const wasActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

            // Toggle current item
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (state.socket) {
        state.socket.disconnect();
    }
    if (state.refreshInterval) {
        clearInterval(state.refreshInterval);
    }
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
    }
});

console.log('WipeMyMail - Ready!');
