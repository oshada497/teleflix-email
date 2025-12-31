import PostalMime from 'postal-mime';

const API_BASE = ''; // Relative path, as Worker serves frontend

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
    };
}

export interface AddressResponse {
    address: string;
    jwt: string;
}

export interface SettingsResponse {
    domains: string[];
}

class ApiService {
    private jwt: string | null = localStorage.getItem('swiftmail_jwt');
    private address: string | null = localStorage.getItem('swiftmail_address');
    private createdAt: number | null = localStorage.getItem('swiftmail_created_at') ? parseInt(localStorage.getItem('swiftmail_created_at')!) : null;

    constructor() {
        if (this.jwt) {
            console.log('Restored session for:', this.address);
        }
        // Fix for existing sessions: if we have an address but no timestamp, set it to now
        if (this.address && (!this.createdAt || isNaN(this.createdAt))) {
            this.createdAt = Date.now();
            localStorage.setItem('swiftmail_created_at', this.createdAt.toString());
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
        localStorage.setItem('swiftmail_jwt', jwt);
        localStorage.setItem('swiftmail_address', address);
        localStorage.setItem('swiftmail_created_at', this.createdAt.toString());
    }

    clearSession() {
        this.jwt = null;
        this.address = null;
        this.createdAt = null;
        localStorage.removeItem('swiftmail_jwt');
        localStorage.removeItem('swiftmail_address');
        localStorage.removeItem('swiftmail_created_at');
    }

    async getDomains(): Promise<string[]> {
        try {
            const res = await fetch(`${API_BASE}/open_api/settings`);
            const data = await res.json() as SettingsResponse;
            return data.domains || [];
        } catch (e) {
            console.error('Failed to fetch settings:', e);
            return ['swiftmail.com']; // Fallback
        }
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
                            date: parsed.date || mail.created_at
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
                            date: mail.created_at
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

    async sendMail(to: string, subject: string, content: string, is_html: boolean = false): Promise<boolean> {
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
                is_html
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
