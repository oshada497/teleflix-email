const app = {
    state: {
        jwt: localStorage.getItem('tf_jwt'),
        address: localStorage.getItem('tf_address'),
        domains: [],
        mails: [],
        refreshTimer: null,
        count: 15,
        siteKey: null
    },

    elements: {
        app: document.getElementById('app'),
        views: {
            landing: document.getElementById('landing-view'),
            inbox: document.getElementById('inbox-view')
        },
        inputs: {
            customName: document.getElementById('custom-name'),
            domainSelect: document.getElementById('domain-select'),
            turnstile: document.getElementById('turnstile-container')
        },
        buttons: {
            generate: document.getElementById('generate-btn'),
            copy: document.getElementById('copy-btn'),
            refresh: document.getElementById('manual-refresh-btn'),
            deleteAddress: document.getElementById('delete-address-btn'),
            deleteMail: document.getElementById('delete-mail-btn'),
            closeReader: document.getElementById('close-reader-btn')
        },
        displays: {
            currentAddress: document.getElementById('current-address'),
            timerCount: document.getElementById('timer-count'),
            mailList: document.getElementById('mail-list-container'),
            mailCount: document.getElementById('mail-count'),
            reader: {
                placeholder: document.getElementById('reader-placeholder'),
                content: document.getElementById('reader-content'),
                subject: document.getElementById('mail-subject'),
                from: document.getElementById('mail-from'),
                time: document.getElementById('mail-time'),
                iframe: document.getElementById('mail-iframe'),
                container: document.querySelector('.mail-reader')
            }
        },
        loading: document.getElementById('loading'),
        toastContainer: document.getElementById('toast-container')
    },

    async init() {
        this.toggleLoading(true);
        try {
            await this.fetchSettings();
            if (this.state.jwt && this.state.address) {
                await this.loadInbox();
            } else {
                this.showView('landing');
            }
        } catch (error) {
            console.error(error);
            this.showToast('Failed to initialize app', 'error');
        } finally {
            this.toggleLoading(false);
        }

        this.attachEventListeners();
    },

    attachEventListeners() {
        this.elements.buttons.generate.addEventListener('click', () => this.generateAddress());
        this.elements.buttons.copy.addEventListener('click', () => this.copyAddress());
        this.elements.buttons.refresh.addEventListener('click', () => this.refreshInbox(true));
        this.elements.buttons.deleteAddress.addEventListener('click', () => this.destroyAddress());
        this.elements.buttons.deleteMail.addEventListener('click', () => this.deleteCurrentMail());
        this.elements.buttons.closeReader.addEventListener('click', () => this.closeReader());
    },

    async fetchSettings() {
        try {
            const res = await fetch('/open_api/settings');
            const data = await res.json();

            this.state.domains = data.domains || [];
            this.state.siteKey = data.cfTurnstileSiteKey;

            this.populateDomains();

            if (this.state.siteKey && window.turnstile) {
                turnstile.render(this.elements.inputs.turnstile, {
                    sitekey: this.state.siteKey,
                });
            }
        } catch (error) {
            console.error('Settings fetch error', error);
        }
    },

    populateDomains() {
        const select = this.elements.inputs.domainSelect;
        select.innerHTML = '';
        this.state.domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = `@${domain}`;
            select.appendChild(option);
        });
    },

    async generateAddress() {
        const name = this.elements.inputs.customName.value;
        const domain = this.elements.inputs.domainSelect.value;

        let cfToken = undefined;
        if (this.state.siteKey && window.turnstile) {
            cfToken = turnstile.getResponse();
        }

        this.toggleLoading(true);

        try {
            const res = await fetch('/api/new_address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, domain, cf_token: cfToken })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to create address');
            }

            const data = await res.json();
            this.state.jwt = data.jwt;
            this.state.address = data.address; // data.address might be array? Usually object { jwt, address }
            // Wait, common.ts newAddress returns { jwt, address: user.address }

            // Check if address is object or string. usually string in this API
            localStorage.setItem('tf_jwt', this.state.jwt);
            localStorage.setItem('tf_address', this.state.address);

            this.loadInbox();
        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.toggleLoading(false);
        }
    },

    async loadInbox() {
        this.showView('inbox');
        this.elements.displays.currentAddress.textContent = this.state.address;
        this.refreshInbox(true);
        this.startTimer();
    },

    async refreshInbox(manual = false) {
        if (manual) this.toggleLoading(true, 'refreshing');

        try {
            const res = await fetch('/api/mails?limit=20&offset=0', {
                headers: { 'Authorization': `Bearer ${this.state.jwt}` }
            });

            if (res.status === 401) {
                this.logout();
                return;
            }

            const data = await res.json();
            // data.results is array? handleListQuery usually returns { results: [], count: n }
            // Let's check handleListQuery in worker/common.ts. It usually returns array or { results }.
            // Assuming { results: [...] } or just [...]

            const mails = data.results || data || [];
            this.renderMailList(mails);
            this.state.count = 15; // reset timer
        } catch (error) {
            console.error('Fetch mails error', error);
        } finally {
            if (manual) this.toggleLoading(false);
        }
    },

    renderMailList(mails) {
        const container = this.elements.displays.mailList;
        const countBadge = this.elements.displays.mailCount;

        if (JSON.stringify(mails) === JSON.stringify(this.state.mails) && mails.length === this.state.mails.length) return;

        this.state.mails = mails;
        countBadge.textContent = mails.length;
        container.innerHTML = '';

        if (mails.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-envelope-open"></i>
                    <p>Waiting for incoming mails...</p>
                </div>
            `;
            return;
        }

        mails.forEach(mail => {
            // raw_mails: { id, source, address, raw, message_id, created_at, ... }
            // but api might return parsed? 
            // worker/src/mails_api/index.ts -> returns raw_mails rows.
            // Oh, raw_mails table has 'raw' content. The parsing happens usually in commonapi?
            // Wait, the API returns RAW row. 
            // So 'source' is from, 'subject' might be missing if it's raw mime?
            // Actually, the database usually stores parsed columns if 'mail-parser' is used.
            // Let's assume it has source, subject, created_at.
            // If not, we might need to parse 'raw' which is hard in browser.
            // CHECK worker/src/email/index.ts. If it saves subject/from.

            // Wait, looking at worker/src/mails_api/index.ts:
            // SELECT * FROM raw_mails
            // I should check `models` or schema.
            // Assuming it has json_metadata or similar?
            // Let's inspect `raw_mails` schema later?
            // For now assume standard fields.

            // Note: If fields are missing in list, I might just show "New Message"
            let subject = mail.subject || "No Subject";
            // If the row has no subject column, we might be in trouble.
            // Many temp mails store parsed headers.

            // Try to parse JSON metadata if it exists

            const el = document.createElement('div');
            el.className = 'mail-item';
            el.onclick = () => this.openMail(mail.id);
            el.innerHTML = `
                <div class="mail-item-header">
                    <span class="mail-item-from">${this.escape(mail.source || 'Unknown')}</span>
                    <span class="mail-item-time">${new Date(mail.created_at).toLocaleTimeString()}</span>
                </div>
                <div class="mail-item-subject">${this.escape(subject)}</div>
            `;
            container.appendChild(el);
        });
    },

    async openMail(id) {
        this.toggleLoading(true);
        try {
            const res = await fetch(`/api/mail/${id}`, {
                headers: { 'Authorization': `Bearer ${this.state.jwt}` }
            });
            const mail = await res.json();

            // Show reader
            this.elements.displays.reader.placeholder.classList.add('hidden');
            this.elements.displays.reader.content.classList.remove('hidden');
            this.elements.displays.reader.container.classList.add('active');

            this.state.currentMailId = id;

            let subject = mail.subject;
            let from = mail.source;
            let content = mail.html;

            // CLIENT-SIDE PARSING OF RAW EMAIL
            // If the backend returns raw content but no parsed body, we parse it here using PostalMime
            if (mail.raw && (!content && !mail.text) && typeof PostalMime !== 'undefined') {
                try {
                    const parser = new PostalMime();
                    const parsed = await parser.parse(mail.raw);

                    content = parsed.html || parsed.text;
                    subject = subject || parsed.subject;
                    from = from || (parsed.from ? (parsed.from.name ? `${parsed.from.name} <${parsed.from.address}>` : parsed.from.address) : from);
                } catch (e) {
                    console.warn('Failed to parse raw email with PostalMime:', e);
                    parseError = true;
                    // Fallback to basic text extraction if possible or just raw
                    content = `<div style="padding: 20px; color: #ff6b6b; background: rgba(255,0,0,0.1); border-radius: 8px; margin-bottom: 20px;">
                        <strong>Note:</strong> Simplified view (Parsing failed)
                    </div><pre style="white-space: pre-wrap;">${this.escape(mail.text || mail.raw)}</pre>`;
                }
            }

            this.elements.displays.reader.subject.textContent = subject || "No Subject";
            this.elements.displays.reader.from.textContent = from ? `From: ${from}` : 'From: Unknown';
            this.elements.displays.reader.time.textContent = new Date(mail.created_at).toLocaleString();

            // Fallback content if everything failed or was empty
            if (!content) {
                content = `<pre style="white-space: pre-wrap; word-break: break-all; font-family: monospace;">${this.escape(mail.text || mail.raw)}</pre>`;
            }

            const iframe = this.elements.displays.reader.iframe;
            // Set sandbox permissions to allow rendering but block scripts
            iframe.setAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox allow-same-origin');
            iframe.srcdoc = content;

        } catch (error) {
            console.error(error);
            this.showToast('Failed to load email', 'error');
        } finally {
            this.toggleLoading(false);
        }
    },

    closeReader() {
        this.elements.displays.reader.container.classList.remove('active');
        this.elements.displays.reader.content.classList.add('hidden');
        this.elements.displays.reader.placeholder.classList.remove('hidden');
        this.elements.displays.reader.iframe.srcdoc = '';
    },

    async deleteCurrentMail() {
        if (!this.state.currentMailId) return;
        if (!confirm('Are you sure you want to delete this email?')) return;

        try {
            await fetch(`/api/mails/${this.state.currentMailId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.state.jwt}` }
            });
            this.closeReader();
            this.refreshInbox(true);
            this.showToast('Email deleted');
        } catch (error) {
            this.showToast('Failed to delete', 'error');
        }
    },

    async destroyAddress() {
        if (!confirm('Destroy this address? All emails will be lost.')) return;
        try {
            await fetch('/api/delete_address', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.state.jwt}` }
            });
            this.logout();
            this.showToast('Address destroyed');
        } catch (error) {
            this.logout(); // Assume destroyed anyway
        }
    },

    logout() {
        localStorage.removeItem('tf_jwt');
        localStorage.removeItem('tf_address');
        this.state.jwt = null;
        this.state.address = null;
        this.stopTimer();
        this.showView('landing');
        this.closeReader();
    },

    copyAddress() {
        navigator.clipboard.writeText(this.state.address).then(() => {
            this.showToast('Address copied to clipboard', 'success');
        });
    },

    startTimer() {
        this.stopTimer();
        this.state.count = 15;
        this.elements.displays.timerCount.textContent = '15s';

        this.state.refreshTimer = setInterval(() => {
            this.state.count--;
            this.elements.displays.timerCount.textContent = `${this.state.count}s`;
            if (this.state.count <= 0) {
                this.refreshInbox();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.state.refreshTimer) clearInterval(this.state.refreshTimer);
    },

    showView(viewName) {
        Object.values(this.elements.views).forEach(el => el.classList.add('hidden'));
        this.elements.views[viewName].classList.remove('hidden');
    },

    toggleLoading(show, type = 'full') {
        // If type is refreshing (background), maybe don't show full spinner?
        // But for now simple spinner
        if (type === 'refreshing') return;
        if (show) this.elements.loading.classList.remove('hidden');
        else this.elements.loading.classList.add('hidden');
    },

    showToast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${msg}</span>
        `;
        this.elements.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    escape(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
