import PostalMime from 'postal-mime'
import { io, Socket } from 'socket.io-client'
import { Email } from '../utils/types'

const API_BASE = 'https://temp-email-api.teleflix.online'
const PUSHER_BASE = 'https://swiftmail-pusher.onrender.com'
const HARDCODED_DOMAINS = ['fbflix.online', 'tempxmail.qzz.io', 'teleflix.online']

interface AuthSession {
    jwt: string
    address: string
    createdAt: number
}

class ApiService {
    private jwt: string | null = null
    private address: string | null = null
    private createdAt: number | null = null
    private socket: Socket | null = null

    constructor() {
        this.jwt = localStorage.getItem('wipemymail_jwt')
        this.address = localStorage.getItem('wipemymail_address')
        const storedCreated = localStorage.getItem('wipemymail_created_at')

        if (storedCreated) {
            this.createdAt = parseInt(storedCreated)
        } else if (this.address) {
            this.createdAt = Date.now()
            localStorage.setItem('wipemymail_created_at', this.createdAt.toString())
        }
    }

    // --- Session Management ---

    private setSession(jwt: string, address: string) {
        this.jwt = jwt
        this.address = address
        this.createdAt = Date.now()
        localStorage.setItem('wipemymail_jwt', jwt)
        localStorage.setItem('wipemymail_address', address)
        localStorage.setItem('wipemymail_created_at', this.createdAt.toString())
    }

    clearSession() {
        this.jwt = null
        this.address = null
        this.createdAt = null
        localStorage.removeItem('wipemymail_jwt')
        localStorage.removeItem('wipemymail_address')
        localStorage.removeItem('wipemymail_created_at')
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    getSession(): AuthSession | null {
        if (this.jwt && this.address && this.createdAt) {
            return {
                jwt: this.jwt,
                address: this.address,
                createdAt: this.createdAt
            }
        }
        return null
    }

    // --- API Interactions ---

    async getDomains(): Promise<string[]> {
        // Fallback to hardcoded if API endpoint assumes these
        // In original code, it tried to get from cache or used hardcoded
        return HARDCODED_DOMAINS
    }

    async createAddress(domain: string, name?: string): Promise<AuthSession> {
        const res = await fetch(`${API_BASE}/api/new_address`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, domain }),
        })

        if (!res.ok) throw new Error('Failed to create address')

        const data = await res.json()
        this.setSession(data.jwt, data.address)

        // Request send access (fire & forget)
        fetch(`${API_BASE}/api/requset_send_mail_access`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${data.jwt}` }
        }).catch(err => console.warn('Failed to request send access', err))

        return {
            jwt: data.jwt,
            address: data.address,
            createdAt: this.createdAt!
        }
    }

    async getMails(limit = 20, offset = 0): Promise<Email[]> {
        if (!this.jwt) return []

        const res = await fetch(`${API_BASE}/api/mails?limit=${limit}&offset=${offset}&_t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${this.jwt}` }
        })

        if (!res.ok) {
            if (res.status === 401) this.clearSession()
            throw new Error(`Failed to fetch mails: ${res.statusText}`)
        }

        const data = await res.json()
        const rawMails = data.results || []

        // Parse emails
        const parser = new PostalMime()
        const parsedMails = await Promise.all(
            rawMails.map(async (mail: any) => {
                try {
                    const parsed = await parser.parse(mail.raw)
                    return {
                        id: mail.id,
                        sender: parsed.from ? (parsed.from.name || parsed.from.address) : 'Unknown',
                        senderEmail: parsed.from?.address || 'unknown@example.com',
                        subject: parsed.subject || '(No Subject)',
                        preview: parsed.text?.substring(0, 100) || '',
                        content: parsed.html || parsed.text || '',
                        timestamp: new Date(mail.created_at),
                        isRead: false, // API doesn't seem to store read state persistently?
                        hasAttachments: parsed.attachments && parsed.attachments.length > 0
                    } as Email
                } catch (e) {
                    console.error('Failed to parse mail', e)
                    return {
                        id: mail.id,
                        sender: 'Unknown',
                        senderEmail: 'unknown',
                        subject: '(Parse Error)',
                        preview: 'Failed to parse email content',
                        content: 'Failed to parse email content',
                        timestamp: new Date(mail.created_at),
                        isRead: false,
                        hasAttachments: false
                    } as Email
                }
            })
        )

        return parsedMails
    }

    async deleteMail(id: string): Promise<boolean> {
        if (!this.jwt) return false
        const res = await fetch(`${API_BASE}/api/mails/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.jwt}` }
        })
        return res.ok
    }

    async deleteAddress(): Promise<boolean> {
        if (!this.jwt) return false
        const res = await fetch(`${API_BASE}/api/delete_address`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.jwt}` }
        })
        if (res.ok) {
            this.clearSession()
        }
        return res.ok
    }

    // --- Real-time Updates ---

    connectSocket(onNewMail?: (mail: Email) => void) {
        if (!this.address) {
            console.warn('[Socket] No address available, skipping connection')
            return
        }

        // Use a property on the socket to track which address it's for
        const currentSocket = this.socket as any

        // Check if already connected to this address
        if (this.socket?.connected && currentSocket?._address === this.address) {
            console.log('[Socket] Already connected to', this.address)
            // Still update the handler in case it changed
            if (onNewMail) {
                this.socket.removeAllListeners('new_email')
                this.socket.on('new_email', (rawMail: any) => this.handleIncomingMail(rawMail, onNewMail))
            }
            return
        }

        console.log('[Socket] Connecting for address:', this.address)

        if (this.socket) {
            this.socket.disconnect()
        }

        this.socket = io(PUSHER_BASE)
            ; (this.socket as any)._address = this.address

        this.socket.on('connect', () => {
            console.log('[Socket] Connected, registering:', this.address)
            this.socket?.emit('register', this.address)
        })

        this.socket.on('new_email', (rawMail: any) => this.handleIncomingMail(rawMail, onNewMail))
    }

    private async handleIncomingMail(rawMail: any, onNewMail?: (mail: Email) => void) {
        console.log('[Socket] New email signal received', rawMail)
        if (!onNewMail) return

        try {
            const parser = new PostalMime()
            const parsed = await parser.parse(rawMail.raw)
            const email: Email = {
                id: rawMail.id || `sock-${Date.now()}`,
                sender: parsed.from ? (parsed.from.name || parsed.from.address || 'Unknown') : 'Unknown',
                senderEmail: parsed.from?.address || 'unknown@example.com',
                subject: parsed.subject || '(No Subject)',
                preview: parsed.text?.substring(0, 100) || '',
                content: parsed.html || parsed.text || '',
                timestamp: new Date(),
                isRead: false,
                hasAttachments: parsed.attachments && parsed.attachments.length > 0
            }
            onNewMail(email)
        } catch (e) {
            console.error('[Socket] Failed to parse incoming mail', e)
        }
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }
}

export const api = new ApiService()
