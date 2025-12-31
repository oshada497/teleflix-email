// ============================================
// TELEFLIX TEMP MAIL - JavaScript Application
// Modern, Dynamic Email Management
// ============================================

class TeleflixTempMail {
    constructor() {
        this.currentEmail = '';
        this.emails = [];
        this.polling = null;
        this.pollingInterval = 5000; // 5 seconds
        
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.generateEmail();
        this.startPolling();
    }

    cacheDOMElements() {
        // Email display
        this.emailInput = document.getElementById('email-address');
        this.copyBtn = document.getElementById('copy-btn');
        this.newAddressBtn = document.getElementById('new-address-btn');
        this.refreshBtn = document.getElementById('refresh-btn');
        
        // Inbox
        this.emailList = document.getElementById('email-list');
        this.inboxStatus = document.getElementById('inbox-status');
        
        // Modal
        this.modal = document.getElementById('email-modal');
        this.modalSubject = document.getElementById('modal-subject');
        this.modalSender = document.getElementById('modal-sender');
        this.modalDate = document.getElementById('modal-date');
        this.modalBody = document.getElementById('modal-body');
        this.closeModalBtn = document.querySelector('.close-modal');
    }

    attachEventListeners() {
        // Copy email
        this.copyBtn.addEventListener('click', () => this.copyEmail());
        
        // Generate new email
        this.newAddressBtn.addEventListener('click', () => this.generateEmail());
        
        // Refresh inbox
        this.refreshBtn.addEventListener('click', () => {
            this.addButtonAnimation(this.refreshBtn);
            this.checkMail();
        });
        
        // Close modal
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.checkMail();
            }
        });
    }

    // ============================================
    // EMAIL GENERATION
    // ============================================
    
    generateEmail() {
        // Check if there's a stored email
        const storedEmail = localStorage.getItem('teleflix_email');
        
        if (storedEmail) {
            this.currentEmail = storedEmail;
        } else {
            // Generate random email
            const username = this.generateUsername();
            const domain = this.getDomain();
            this.currentEmail = `${username}@${domain}`;
            localStorage.setItem('teleflix_email', this.currentEmail);
        }
        
        this.displayEmail();
        this.checkMail();
    }

    generateUsername() {
        const adjectives = ['cool', 'fast', 'bright', 'quick', 'smart', 'swift', 'cyber', 'neon', 'ultra', 'mega'];
        const nouns = ['cat', 'dog', 'bird', 'fish', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 9999);
        return `${adj}${noun}${num}`;
    }

    getDomain() {
        // Get domain from current URL or use default
        const hostname = window.location.hostname;
        return hostname === 'localhost' || hostname === '127.0.0.1' 
            ? 'teleflix.temp' 
            : hostname;
    }

    displayEmail() {
        this.emailInput.value = this.currentEmail;
        this.animateEmailDisplay();
    }

    animateEmailDisplay() {
        this.emailInput.classList.add('success');
        setTimeout(() => {
            this.emailInput.classList.remove('success');
        }, 1000);
    }

    // ============================================
    // COPY FUNCTIONALITY
    // ============================================
    
    async copyEmail() {
        try {
            await navigator.clipboard.writeText(this.currentEmail);
            this.showCopySuccess();
        } catch (err) {
            // Fallback for older browsers
            this.emailInput.select();
            document.execCommand('copy');
            this.showCopySuccess();
        }
    }

    showCopySuccess() {
        const originalHTML = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        this.copyBtn.classList.add('success');
        
        setTimeout(() => {
            this.copyBtn.innerHTML = originalHTML;
            this.copyBtn.classList.remove('success');
        }, 2000);
    }

    // ============================================
    // MAIL CHECKING & POLLING
    // ============================================
    
    async checkMail() {
        try {
            this.updateStatus('Checking mail...', 'loading');
            
            // Simulate API call - Replace with actual API endpoint
            const emails = await this.fetchEmails();
            
            this.emails = emails;
            this.renderEmails();
            
            if (emails.length > 0) {
                this.updateStatus(`${emails.length} email${emails.length > 1 ? 's' : ''}`, 'success');
            } else {
                this.updateStatus('Waiting for emails...', 'waiting');
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            this.updateStatus('Error checking mail', 'error');
        }
    }

    async fetchEmails() {
        // TODO: Replace with actual API call
        // For now, return mock data for demonstration
        
        // Example API call structure:
        // const response = await fetch(`/api/emails/${this.currentEmail}`);
        // return await response.json();
        
        // Mock data for demonstration
        return this.getMockEmails();
    }

    getMockEmails() {
        // Generate some mock emails for demonstration
        const mockEmails = [
            {
                id: 1,
                from: 'welcome@service.com',
                subject: 'Welcome to Our Service!',
                preview: 'Thank you for signing up. Here is your verification code: 123456',
                date: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
                body: '<h2>Welcome!</h2><p>Thank you for signing up. Your verification code is: <strong>123456</strong></p>'
            },
            {
                id: 2,
                from: 'no-reply@github.com',
                subject: 'Reset your password',
                preview: 'Click the link below to reset your password...',
                date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                body: '<h2>Password Reset</h2><p>Click <a href="#">here</a> to reset your password.</p>'
            }
        ];
        
        // Only return mock emails in development
        return window.location.hostname === 'localhost' ? mockEmails : [];
    }

    startPolling() {
        // Check mail immediately
        this.checkMail();
        
        // Then poll every interval
        this.polling = setInterval(() => {
            this.checkMail();
        }, this.pollingInterval);
    }

    stopPolling() {
        if (this.polling) {
            clearInterval(this.polling);
            this.polling = null;
        }
    }

    // ============================================
    // EMAIL RENDERING
    // ============================================
    
    renderEmails() {
        if (this.emails.length === 0) {
            this.emailList.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-envelope-open"></i>
                    <p>Your inbox is empty.</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--text-muted);">
                        Emails sent to ${this.currentEmail} will appear here.
                    </p>
                </div>
            `;
            return;
        }

        this.emailList.innerHTML = this.emails.map(email => this.createEmailItem(email)).join('');
        
        // Attach click handlers
        document.querySelectorAll('.email-item').forEach((item, index) => {
            item.addEventListener('click', () => this.openEmail(this.emails[index]));
        });
    }

    createEmailItem(email) {
        const timeAgo = this.getTimeAgo(email.date);
        const preview = email.preview || 'No preview available';
        
        return `
            <div class="email-item" data-id="${email.id}">
                <div class="email-item-header">
                    <span class="email-sender">${this.escapeHtml(email.from)}</span>
                    <span class="email-date">${timeAgo}</span>
                </div>
                <div class="email-subject">${this.escapeHtml(email.subject)}</div>
                <div class="email-preview">${this.escapeHtml(preview)}</div>
            </div>
        `;
    }

    // ============================================
    // EMAIL MODAL
    // ============================================
    
    openEmail(email) {
        this.modalSubject.textContent = email.subject;
        this.modalSender.innerHTML = `<i class="fa-solid fa-envelope"></i> From: ${this.escapeHtml(email.from)}`;
        this.modalDate.innerHTML = `<i class="fa-solid fa-clock"></i> ${this.formatDate(email.date)}`;
        
        // Display email body
        if (email.html) {
            // If HTML content, display in iframe for safety
            this.modalBody.innerHTML = `<iframe srcdoc="${this.escapeHtml(email.html)}"></iframe>`;
        } else if (email.body) {
            this.modalBody.innerHTML = email.body;
        } else {
            this.modalBody.innerHTML = '<p>No content available.</p>';
        }
        
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ============================================
    // STATUS UPDATES
    // ============================================
    
    updateStatus(message, type = 'waiting') {
        this.inboxStatus.textContent = message;
        this.inboxStatus.className = 'status-badge';
        
        switch (type) {
            case 'loading':
                this.inboxStatus.style.borderColor = 'var(--accent-cyan)';
                this.inboxStatus.style.color = 'var(--accent-cyan)';
                break;
            case 'success':
                this.inboxStatus.style.borderColor = 'var(--primary-glow)';
                this.inboxStatus.style.color = 'var(--primary-glow)';
                break;
            case 'error':
                this.inboxStatus.style.borderColor = 'var(--accent-pink)';
                this.inboxStatus.style.color = 'var(--accent-pink)';
                break;
            default:
                this.inboxStatus.style.borderColor = 'var(--primary-glow)';
                this.inboxStatus.style.color = 'var(--primary-glow)';
        }
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Just now';
    }

    formatDate(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addButtonAnimation(button) {
        button.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            button.style.transform = '';
        }, 500);
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.teleflixApp = new TeleflixTempMail();
    });
} else {
    window.teleflixApp = new TeleflixTempMail();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.teleflixApp) {
        window.teleflixApp.stopPolling();
    }
});
