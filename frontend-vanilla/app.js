/**
 * Teleflix Temp Mail - Vanilla JS Application
 * Modern, Lightweight interface for Cloudflare Temp Email
 */

const API_BASE = ""; // Relative if served from same origin, or specify URL if separate

// State Management
const state = {
    address: localStorage.getItem('tm_address') || '',
    jwt: localStorage.getItem('tm_jwt') || '', // Token for the specific mailbox
    userJwt: localStorage.getItem('tm_user_jwt') || '', // Token for the user (account)
    emails: [],
    timer: null,
    domains: [],
    settings: {},
    autoRefreshInterval: null
};

// DOM Elements
const elements = {
    emailInput: document.getElementById('current-email'),
    copyBtn: document.getElementById('copy-email-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    messageList: document.getElementById('message-list'),
    inboxCount: document.getElementById('inbox-count'),
    emailViewer: document.getElementById('email-viewer'),
    closeViewerBtns: document.querySelectorAll('.close-modal'), // Close email viewer
    customBtn: document.getElementById('custom-btn'),
    customModal: document.getElementById('custom-email-modal'),
    closeCustomModalBtn: document.querySelector('.close-custom-modal'),
    createCustomBtn: document.getElementById('create-custom-btn'),
    customNameInput: document.getElementById('custom-name'),
    domainSelect: document.getElementById('domain-select'),
    viewSubject: document.getElementById('view-subject'),
    viewFrom: document.getElementById('view-from'),
    viewEmail: document.getElementById('view-email'),
    viewDate: document.getElementById('view-date'),
    viewBody: document.getElementById('view-body'),
    senderAvatar: document.getElementById('sender-avatar'),
    notificationContainer: document.getElementById('notification-container')
};

// --- Initialization ---

async function init() {
    console.log("Teleflix Mail Initializing...");

    // Check if we have a stored address
    if (state.address && state.jwt) {
        elements.emailInput.value = state.address;
        loadInbox();
    } else {
        // Create new address if none
        await createNewAddress();
    }

    // Load Settings (Domains, etc)
    await loadSettings();

    // Event Listeners
    setupEventListeners();

    // Auto Refresh
    startAutoRefresh();
}

// --- API Interactions ---

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.jwt}`
    };

    if (state.userJwt) {
        headers['x-user-token'] = state.userJwt;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error("API Call Failed:", error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function createNewAddress(customName = null, domain = null) {
    elements.emailInput.value = "Generating...";

    let url = '/api/new_address';
    if (customName && domain) {
        url += `?name=${encodeURIComponent(customName)}&domain=${encodeURIComponent(domain)}`;
    }

    try {
        const data = await apiCall(url);
        // Expecting { address: "...", jwt: "..." }
        state.address = data.address;
        state.jwt = data.jwt;

        // Persist
        localStorage.setItem('tm_address', state.address);
        localStorage.setItem('tm_jwt', state.jwt);

        elements.emailInput.value = state.address;
        showNotification("New address created successfully!", "success");

        // Clear inbox logic
        state.emails = [];
        renderInbox();
    } catch (e) {
        elements.emailInput.value = "Error creating address";
    }
}

async function loadInbox(silent = false) {
    if (!state.address) return;

    if (!silent) {
        const loader = document.querySelector('.empty-state .loader-dots');
        if (loader && state.emails.length === 0) loader.style.display = 'block';
    }

    // Rotate refresh icon
    const icon = elements.refreshBtn.querySelector('i');
    icon.classList.add('fa-spin');

    try {
        const data = await apiCall(`/api/mails?limit=20&offset=0`);
        // Use data.results if paginated, or data if direct list
        const messages = data.results || data;

        // Simple diff check to avoid re-rendering if no changes? 
        // For simplicity, just render.
        state.emails = messages;
        renderInbox();

    } catch (e) {
        // console.error("Inbox load failed", e);
    } finally {
        setTimeout(() => icon.classList.remove('fa-spin'), 1000);
    }
}

async function getEmailContent(id) {
    try {
        const data = await apiCall(`/api/mails/${id}`);
        return data; // { id, from, subject, date, html, text, attachments... }
    } catch (e) {
        showNotification("Failed to load email content", "error");
        return null;
    }
}

async function loadSettings() {
    try {
        const data = await apiCall('/open_api/settings');
        state.settings = data;
        state.domains = data.domains || [];

        // Populate domain select
        elements.domainSelect.innerHTML = state.domains.map(d => `<option value="${d}">@${d}</option>`).join('');
    } catch (e) {
        console.warn("Could not load settings");
    }
}

// --- UI Rendering ---

function renderInbox() {
    elements.inboxCount.textContent = state.emails.length;

    if (state.emails.length === 0) {
        elements.messageList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon-wrapper">
                   <i class="fa-regular fa-envelope-open"></i>
                </div>
                <h3>Your inbox is empty</h3>
                <p>Waiting for incoming messages...</p>
                 <div class="loader-dots" style="display:block">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        return;
    }

    elements.messageList.innerHTML = state.emails.map(msg => `
        <div class="message-item swing-in" onclick="openEmail('${msg.id}')">
            <div class="msg-left">
                <div class="sender-avatar">${msg.from.charAt(0).toUpperCase()}</div>
                <div class="msg-info">
                    <span class="msg-sender">${escapeHtml(msg.from)}</span>
                    <span class="msg-subject">${escapeHtml(msg.subject) || '(No Subject)'}</span>
                </div>
            </div>
            <div class="msg-right">
                <span class="msg-time">${formatDate(msg.created_at || msg.date)}</span>
                <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; opacity: 0.5;"></i>
            </div>
        </div>
    `).join('');
}

async function openEmail(id) {
    // Show loading state in modal?
    const msg = state.emails.find(m => m.id == id);
    if (msg) {
        // Pre-fill header data while loading body
        fillEmailView(msg, "Loading content...");
        elements.emailViewer.classList.remove('hidden');

        // Fetch full content
        const fullContent = await getEmailContent(id);
        if (fullContent) {
            fillEmailView(fullContent, fullContent.html || fullContent.text || "No Content");
        }
    }
}

function fillEmailView(msg, bodyContent) {
    elements.viewSubject.textContent = msg.subject || "(No Subject)";
    elements.viewFrom.textContent = getSenderName(msg.from);
    elements.viewEmail.textContent = `<${msg.from}>`; // Parse if needed
    elements.viewDate.textContent = formatDate(msg.created_at || msg.date);
    elements.senderAvatar.textContent = msg.from.charAt(0).toUpperCase();

    // Body handling
    const shadowHost = document.createElement('div');
    elements.viewBody.innerHTML = ''; // Clear previous
    // To protect styles, we might use a shadow DOM here or just an iframe
    // Since this is vanilla simple app, let's just use a Sandbox Iframe for security and style isolation

    // Check if bodyContent is just loading text
    if (bodyContent === "Loading content...") {
        elements.viewBody.innerHTML = '<div style="text-align:center; padding: 20px;">Cannot wait... Loading...</div>';
        return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
    iframe.sandbox = "allow-same-origin"; // Restricted actions

    elements.viewBody.appendChild(iframe);

    // Write content
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(bodyContent);
    iframe.contentWindow.document.close();

    // Adjust height
    // iframe.onload = function() {
    //     this.style.height = this.contentWindow.document.body.scrollHeight + 'px';
    // }
}

// --- Event Handlers ---

function setupEventListeners() {
    // Copy Address
    elements.copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(elements.emailInput.value);
        showNotification("Address copied to clipboard!", "success");
    });

    // Refresh
    elements.refreshBtn.addEventListener('click', () => {
        loadInbox();
        showNotification("Inbox refreshed", "info");
    });

    // Close Viewer
    elements.closeViewerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.emailViewer.classList.add('hidden');
        });
    });

    // Custom Email Modal
    elements.customBtn.addEventListener('click', () => {
        elements.customModal.classList.remove('hidden');
    });

    elements.closeCustomModalBtn.addEventListener('click', () => {
        elements.customModal.classList.add('hidden');
    });

    elements.createCustomBtn.addEventListener('click', async () => {
        const name = elements.customNameInput.value.trim();
        const domain = elements.domainSelect.value;
        if (!name) {
            showNotification("Please enter a username", "error");
            return;
        }
        elements.customModal.classList.add('hidden');
        await createNewAddress(name, domain);
    });

    // Theme Toggle (Simple)
    document.getElementById('theme-toggle').addEventListener('click', () => {
        // Toggle dark/light classes or var overrides
        // For now, it's premium dark mode by default.
        showNotification("Theme toggle coming soon!", "info");
    });
}

function startAutoRefresh() {
    if (state.autoRefreshInterval) clearInterval(state.autoRefreshInterval);
    state.autoRefreshInterval = setInterval(() => {
        loadInbox(true);
    }, 15000); // 15 seconds
}

// --- Utilities ---

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
}

function getSenderName(from) {
    // Extract Name if format is "Name <email>"
    const match = from.match(/(.*)<.*>/);
    return match ? match[1].trim() : from;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    notif.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    elements.notificationContainer.appendChild(notif);

    // Remove after 3s
    setTimeout(() => {
        notif.style.animation = 'slideIn 0.3s reverse forwards'; // Needs reverse anim logic or just fade out
        notif.style.transform = 'translateX(120%)';
        notif.style.transition = 'transform 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Run
window.addEventListener('DOMContentLoaded', init);
