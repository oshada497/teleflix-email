// UI Helper Functions

const UI = {
    // Show/Hide Modal
    showModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
    },

    hideModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    },

    hideAllModals() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    },

    // Render Email List
    renderEmailList(emails) {
        const list = document.getElementById('inbox-list');

        if (!emails || emails.length === 0) {
            list.innerHTML = `
                <div class="inbox-empty">
                    <svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <h3>Your inbox is empty</h3>
                    <p>Emails sent to your temporary address will appear here instantly.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = emails.map((email, index) => {
            const initial = email.parsed.from.charAt(0).toUpperCase();
            const time = new Date(email.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `
                <div class="email-item" data-email-id="${email.id}" data-index="${index}">
                    <div class="email-avatar">${initial}</div>
                    <div class="email-content">
                        <div class="email-header">
                            <div class="email-from">${this.escapeHtml(email.parsed.from)}</div>
                            <div class="email-time">${time}</div>
                        </div>
                        <div class="email-subject">${this.escapeHtml(email.parsed.subject)}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Show Email Modal
    showEmailModal(email) {
        document.getElementById('email-subject').textContent = email.parsed.subject;
        document.getElementById('email-from').textContent = email.parsed.from;
        document.getElementById('email-date').textContent = new Date(email.created_at).toLocaleString();

        const body = document.getElementById('email-body');
        if (email.parsed.html) {
            // Sanitize HTML using DOMPurify
            const sanitized = DOMPurify.sanitize(
                email.parsed.html.replace(/<a\s+(?![^>]*target=)/gi, '<a target="_blank" rel="noopener noreferrer" '),
                {
                    ADD_ATTR: ['target'],
                    ALLOWED_TAGS: [
                        'a', 'b', 'i', 'u', 'strong', 'em', 'p', 'br', 'div', 'span',
                        'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr'
                    ]
                }
            );
            body.innerHTML = sanitized;
        } else {
            // Plain text with link detection
            const text = email.parsed.text || 'No content';
            const linkedText = text.replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
            );
            body.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${linkedText}</pre>`;
        }

        this.showModal('email-modal');
    },

    // Show QR Code
    async showQRCode(email) {
        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = ''; // Clear previous

        document.getElementById('qr-email').textContent = email;

        if (typeof QRCode !== 'undefined') {
            try {
                await QRCode.toCanvas(
                    qrContainer,
                    email,
                    {
                        width: 256,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#ffffff'
                        }
                    }
                );
            } catch (err) {
                console.error('QR code generation failed:', err);
                qrContainer.innerHTML = '<p style="color: #ef4444;">Failed to generate QR code</p>';
            }
        } else {
            qrContainer.innerHTML = '<p style="color: #ef4444;">QR library not loaded</p>';
        }

        this.showModal('qr-modal');
    },

    // Show Confirmation Dialog
    showConfirm(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;

        const confirmBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        // Remove old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newConfirmBtn.addEventListener('click', () => {
            this.hideModal('confirm-modal');
            onConfirm();
        });

        newCancelBtn.addEventListener('click', () => {
            this.hideModal('confirm-modal');
        });

        this.showModal('confirm-modal');
    },

    // Update Countdown Timer
    updateCountdown(createdAt) {
        if (!createdAt) return;

        const timer = document.getElementById('countdown-timer');
        const elapsed = Date.now() - createdAt;
        const remaining = Math.max(0, 24 * 60 * 60 * 1000 - elapsed);

        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

        timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (remaining === 0) {
            timer.textContent = 'EXPIRED';
        }
    },

    // Copy to Clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Copy failed:', err);
            return false;
        }
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Show Loading State
    setLoading(elementId, isLoading) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (isLoading) {
            element.classList.add('rotate');
        } else {
            element.classList.remove('rotate');
        }
    }
};
