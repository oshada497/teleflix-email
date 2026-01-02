// API Service - Vanilla JS
const API_BASE = 'https://temp-email-api.teleflix.online';
const HARDCODED_DOMAINS = ["fbflix.online", "tempxmail.qzz.io", "teleflix.online"];

class ApiService {
    constructor() {
        this.jwt = localStorage.getItem('wipemymail_jwt');
        this.address = localStorage.getItem('wipemymail_address');
        this.createdAt = this.initCreatedAt();
        console.log("WipeMyMail Client v2.0 - Vanilla JS");

        // Fix for existing sessions
        if (this.address && !this.createdAt) {
            this.createdAt = Date.now();
            localStorage.setItem('wipemymail_created_at', this.createdAt.toString());
        }

        // Cache for libraries
        this.PostalMime = null;
    }

    async loadPostalMime() {
        if (this.PostalMime) return this.PostalMime;
        try {
            // Load ES Module version dynamically
            const module = await import('https://cdn.jsdelivr.net/npm/postal-mime@2.7.1/+esm');
            this.PostalMime = module.default;
            return this.PostalMime;
        } catch (e) {
            console.error("Could not load PostalMime library:", e);
            return null;
        }
    }

    initCreatedAt() {
        const stored = localStorage.getItem('wipemymail_created_at');
        if (stored && stored !== "null" && stored !== "undefined") {
            const parsed = parseInt(stored);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }

    getJwt() {
        return this.jwt;
    }

    getAddress() {
        return this.address;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    setSession(jwt, address) {
        this.jwt = jwt;
        this.address = address;
        this.createdAt = Date.now();
        localStorage.setItem('wipemymail_jwt', jwt);
        localStorage.setItem('wipemymail_address', address);
        localStorage.setItem('wipemymail_created_at', this.createdAt.toString());
    }

    clearSession() {
        this.jwt = null;
        this.address = null;
        this.createdAt = null;
        localStorage.removeItem('wipemymail_jwt');
        localStorage.removeItem('wipemymail_address');
        localStorage.removeItem('wipemymail_created_at');
    }

    async getDomains() {
        const cached = localStorage.getItem('wipemymail_domains');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }
        return HARDCODED_DOMAINS;
    }

    async createAddress(domain, name) {
        const res = await fetch(`${API_BASE}/api/new_address`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, domain }),
        });

        if (!res.ok) {
            throw new Error('Failed to create address');
        }

        const data = await res.json();
        this.setSession(data.jwt, data.address);

        // Request send access
        try {
            await fetch(`${API_BASE}/api/requset_send_mail_access`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${data.jwt}` }
            });
        } catch (e) {
            console.warn("Failed to request send access", e);
        }

        return data;
    }

    async getMails(limit = 20, offset = 0) {
        if (!this.jwt) return [];

        const res = await fetch(`${API_BASE}/api/mails?limit=${limit}&offset=${offset}&_t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${this.jwt}`
            }
        });

        if (!res.ok) {
            if (res.status === 401) {
                this.clearSession();
            }
            throw new Error(`Failed to fetch mails: ${res.statusText}`);
        }

        const data = await res.json();
        const rawMails = data.results || [];

        // Parse mails using postal-mime behavior
        // Load library first (once)
        const PostalMime = await this.loadPostalMime();
        if (!PostalMime) {
            console.warn('PostalMime failed to load - showing raw content');
            // Fallback to basic parsing if library fails
            return rawMails.map(mail => this.createFallbackMail(mail));
        }

        const parsedMails = await Promise.all(
            rawMails.map(async (mail) => {
                try {
                    const parser = new PostalMime();
                    const parsed = await parser.parse(mail.raw);

                    return {
                        ...mail,
                        parsed: {
                            from: parsed.from ? `${parsed.from.name || ''} <${parsed.from.address}>`.trim() : 'Unknown',
                            subject: parsed.subject || '(No Subject)',
                            html: parsed.html || '',
                            text: parsed.text || '',
                            date: parsed.date || mail.created_at,
                            attachments: parsed.attachments || []
                        }
                    };
                } catch (e) {
                    console.error('Failed to parse mail:', e);
                    return this.createFallbackMail(mail);
                }
            })
        );

        return parsedMails;
    }

    createFallbackMail(mail) {
        return {
            ...mail,
            parsed: {
                from: 'Unknown',
                subject: '(Parse Error)',
                html: '',
                text: 'Failed to parse email content',
                date: mail.created_at,
                attachments: []
            }
        };
    }

    async deleteMail(id) {
        if (!this.jwt) return false;
        const res = await fetch(`${API_BASE}/api/mails/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.jwt}`
            }
        });
        return res.ok;
    }

    async getSendbox(limit = 20, offset = 0) {
        if (!this.jwt) return [];

        const res = await fetch(`${API_BASE}/api/sendbox?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${this.jwt}`
            }
        });

        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []).map((item) => {
            try {
                const content = JSON.parse(item.raw);
                return {
                    ...item,
                    ...content,
                    to_mail: content.to_mail || 'Unknown',
                    subject: content.subject || '(No Subject)'
                };
            } catch {
                return item;
            }
        });
    }

    async sendMail(to, subject, content, is_html = false, cf_token) {
        if (!this.jwt) throw new Error("Not logged in");
        const res = await fetch(`${API_BASE}/api/send_mail`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to_mail: to,
                subject,
                content,
                is_html,
                cf_token
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || res.statusText);
        }
        return true;
    }
}

// Export global instance
const api = new ApiService();
