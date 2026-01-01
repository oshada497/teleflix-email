import PostalMime from 'postal-mime';

const API_BASE = 'https://api.wipemymail.com'; // Point to Worker API

export interface Mail {
    id: number;
    message_id: string;
    source: string;
    address: string;
    raw: string;
    created_at: string;
    // Parsed fields
    parsed?: {
        from: string;
        subject: string;
        html: string;
        text: string;
        date: string;
        attachments: any[];
    };
}

export interface AddressResponse {
    address: string;
    jwt: string;
}

export interface SettingsResponse {
    domains: string[];
}

const HARDCODED_DOMAINS = ["wipemymail.com", "fbflix.online", "tempxmail.qzz.io", "teleflix.online"];

class ApiService {
    private jwt: string | null = localStorage.getItem('wipemymail_jwt');
    private address: string | null = localStorage.getItem('wipemymail_address');
    private createdAt: number | null = this.initCreatedAt();

    private initCreatedAt(): number | null {
        const stored = localStorage.getItem('wipemymail_created_at');
        if (stored && stored !== "null" && stored !== "undefined") {
            const parsed = parseInt(stored);
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }

    constructor() {
        console.log("WipeMyMail Client v1.0 - Domain Migration Active");
        // Fix for existing sessions: if we have an address but no timestamp, set it to now
        if (this.address && !this.createdAt) {
            this.createdAt = Date.now();
            localStorage.setItem('wipemymail_created_at', this.createdAt.toString());
        }
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

    setSession(jwt: string, address: string) {
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

    async getDomains(): Promise<string[]> {
        // First, check if we have them in local storage to avoid ANY request
        const cached = localStorage.getItem('wipemymail_domains');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // Return hardcoded list immediately to save a Worker request
        // You can update this list whenever you add new domains
        return HARDCODED_DOMAINS;
    }

    async createAddress(domain?: string, name?: string): Promise<AddressResponse> {
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

        // Automatically request send access for the new address
        try {
            await fetch(`${API_BASE}/api/requset_send_mail_access`, { // Note: Backend has typo 'requset'
                method: 'POST',
                headers: { 'Authorization': `Bearer ${data.jwt}` }
            });
        } catch (e) {
            console.warn("Failed to request send access", e);
        }

        return data;
    }

    async getMails(limit = 20, offset = 0): Promise<Mail[]> {
        if (!this.jwt) return [];

        const res = await fetch(`${API_BASE}/api/mails?limit=${limit}&offset=${offset}`, {
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

        // Parse mails in parallel
        const parsedMails = await Promise.all(
            rawMails.map(async (mail: any) => {
                try {
                    const parser = new PostalMime();
                    const parsed = await parser.parse(mail.raw);
                    return {
                        ...mail,
                        parsed: {
                            from: parsed.from ? `${parsed.from.name ? parsed.from.name + ' ' : ''}<${parsed.from.address}>` : 'Unknown',
                            subject: parsed.subject || '(No Subject)',
                            html: parsed.html || '',
                            text: parsed.text || '',
                            date: parsed.date || mail.created_at,
                            attachments: parsed.attachments || []
                        }
                    };
                } catch (e) {
                    console.error('Failed to parse mail:', e);
                    return {
                        ...mail,
                        parsed: {
                            from: 'Unknown',
                            subject: '(Parse Error)',
                            html: '',
                            text: 'Failed to parse',
                            date: mail.created_at,
                            attachments: []
                        }
                    };
                }
            })
        );

        return parsedMails;
    }

    async deleteMail(id: number): Promise<boolean> {
        if (!this.jwt) return false;
        const res = await fetch(`${API_BASE}/api/mails/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.jwt}`
            }
        });
        return res.ok;
    }

    async getSendbox(limit = 20, offset = 0): Promise<any[]> {
        if (!this.jwt) return [];

        const res = await fetch(`${API_BASE}/api/sendbox?limit=${limit}&offset=${offset}`, {
            headers: {
                'Authorization': `Bearer ${this.jwt}`
            }
        });

        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []).map((item: any) => {
            try {
                const content = JSON.parse(item.raw);
                // Ensure we display something useful
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

    async sendMail(to: string, subject: string, content: string, is_html: boolean = false, cf_token?: string): Promise<boolean> {
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

export const api = new ApiService();
