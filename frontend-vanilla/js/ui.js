const ui = {
    init() {
        // Any init logic
    },

    renderInbox(mails, onSelect) {
        const listContainer = document.getElementById('inbox-list');
        const emptyState = document.getElementById('inbox-empty');

        if (!listContainer) return;

        // Reset list but keep empty state
        listContainer.innerHTML = '';
        if (emptyState) listContainer.appendChild(emptyState);

        if (!mails || mails.length === 0) {
            if (emptyState) {
                emptyState.classList.remove('hidden');
                emptyState.style.display = 'flex';
            }
            return;
        }

        if (emptyState) {
            emptyState.classList.add('hidden');
            emptyState.style.display = 'none';
        }

        mails.forEach(mail => {
            const item = document.createElement('div');
            // 'unread' styling if needed, currently just base class
            const isUnread = !mail.isRead;
            item.className = `email-item flex items-start gap-4 ${isUnread ? 'unread' : ''}`;
            item.setAttribute('data-id', mail.id);

            // Format Time
            const time = new Date(mail.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const senderName = mail.fromName || mail.from || 'Unknown';
            const senderInitial = senderName.charAt(0).toUpperCase();

            // Safe HTML construction
            item.innerHTML = `
                <div class="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
                    ${senderInitial}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">${escapeHtml(senderName)}</h3>
                        <span class="text-xs text-slate-400 whitespace-nowrap ml-2">${time}</span>
                    </div>
                    <h4 class="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1 truncate">${escapeHtml(mail.subject || '(No Subject)')}</h4>
                    <p class="text-xs text-slate-500 truncate">${escapeHtml(mail.intro || mail.preview || 'No preview available')}</p>
                </div>
            `;

            item.addEventListener('click', () => onSelect(mail.id));
            listContainer.appendChild(item);
        });

        // Ensure scrollbar style is applied via CSS class 'custom-scrollbar' on parent
    },

    renderEmailDetail(mail) {
        const placeholder = document.getElementById('detail-placeholder');
        const contentEl = document.getElementById('detail-content');

        if (placeholder) {
            placeholder.classList.add('hidden');
            placeholder.classList.remove('flex');
        }

        if (contentEl) {
            contentEl.classList.remove('hidden');
            contentEl.classList.add('flex');
        }

        // Populate Fields
        const subjectEl = document.getElementById('detail-subject');
        if (subjectEl) subjectEl.textContent = mail.subject || '(No Subject)';

        const senderEl = document.getElementById('detail-sender');
        if (senderEl) senderEl.textContent = mail.fromName || mail.from;

        const fromEl = document.getElementById('detail-from');
        if (fromEl) fromEl.textContent = `<${mail.from}>`;

        const dateEl = document.getElementById('detail-date');
        if (dateEl) dateEl.textContent = new Date(mail.createdAt || Date.now()).toLocaleString();

        // Body Content (Sanitized)
        const bodyContainer = document.getElementById('detail-body');
        if (bodyContainer) {
            const cleanHtml = DOMPurify.sanitize(mail.html || mail.text || '<i>No content</i>');
            bodyContainer.innerHTML = cleanHtml;
        }
    },

    clearDetailView() {
        const placeholder = document.getElementById('detail-placeholder');
        const contentEl = document.getElementById('detail-content');

        if (placeholder) {
            placeholder.classList.remove('hidden');
            placeholder.classList.add('flex');
        }

        if (contentEl) {
            contentEl.classList.add('hidden');
            contentEl.classList.remove('flex');
        }
    },

    showQRCode(text) {
        const modal = document.getElementById('qr-modal');
        const overlay = document.getElementById('modal-overlay');
        const qrContainer = document.getElementById('qr-code');
        const emailText = document.getElementById('qr-email');

        if (!modal || !overlay || !qrContainer) return;

        qrContainer.innerHTML = '';
        if (emailText) emailText.textContent = text;

        new QRCode(qrContainer, {
            text: text,
            width: 200,
            height: 200
        });

        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');

        // Close handlers logic moved to app.js or handled here? 
        // Let's keep distinct close handler logic in HTML/globally if possible, or bind once
        // For now, simpler to re-bind or rely on global close
        const closeBtn = document.getElementById('close-qr-modal');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
                overlay.classList.add('hidden');
            };
        }

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                modal.classList.add('hidden');
                overlay.classList.add('hidden');
            }
        }
    }
};

// Simple HTML escaper
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function (m) { return map[m]; });
}
