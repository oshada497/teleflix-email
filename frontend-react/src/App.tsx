import { useEffect, useState, useCallback } from 'react'
import { Moon, Sun, Shield, Zap, Lock, LogOut } from 'lucide-react'
import { EmailGenerator } from './components/EmailGenerator'
import { EmailInbox } from './components/EmailInbox'
import { EmailDetail } from './components/EmailDetail'
import { ConfirmModal } from './components/ConfirmModal'
import { QRCodeModal } from './components/QRCodeModal'
import { FeatureGrid } from './components/FeatureGrid'
import { Testimonials } from './components/Testimonials'
import { FAQ } from './components/FAQ'
import { Email } from './utils/types'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from './services/api'
import { Button } from './components/ui/Button'

export function App() {
    const [isDark, setIsDark] = useState(false)
    const [emailAddress, setEmailAddress] = useState<string | null>(null)
    const [emails, setEmails] = useState<Email[]>([])
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false) // For manual refresh animation
    const [isGenerating, setIsGenerating] = useState(false)
    const [domains, setDomains] = useState<string[]>([])
    const [selectedDomain, setSelectedDomain] = useState<string>('')
    const [createdAt, setCreatedAt] = useState<number | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)

    // Initialize
    useEffect(() => {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDark(true)
        }

        // Check for session in URL (QR Scan recovery)
        const params = new URLSearchParams(window.location.search)
        const token = params.get('t')
        const addr = params.get('a')
        const ts = params.get('c')

        if (token && addr && ts) {
            api.restoreSession(token, addr, parseInt(ts))
            // Remove params from URL and reload to clean state
            window.history.replaceState({}, document.title, window.location.pathname)
            // Continue with normal initialization
        }

        // Check for existing session
        const session = api.getSession()
        if (session) {
            setEmailAddress(session.address)
            setCreatedAt(session.createdAt)
            loadEmails()
            api.connectSocket(handleNewEmail)
        }

        // Fetch domains
        api.getDomains().then(doms => {
            setDomains(doms)
            if (doms.length > 0 && !selectedDomain) {
                setSelectedDomain(doms[0])
            }

            // If no session, create initial email with first domain
            if (!session && doms.length > 0) {
                createNewEmail(doms[0])
            }
        })

        return () => {
            api.disconnectSocket()
        }
    }, [])

    // Dark mode toggle
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDark])

    const handleNewEmail = useCallback((email: Email) => {
        setEmails((prev) => {
            // Avoid duplicates
            if (prev.some(e => e.id === email.id)) return prev
            return [email, ...prev]
        })
    }, [])

    const loadEmails = useCallback(async (isManual = false) => {
        if (isManual) setIsRefreshing(true)
        else setIsLoading(true)

        try {
            const fetched = await api.getMails(50)
            setEmails(fetched)
        } catch (e) {
            console.error('Failed to load emails', e)
        } finally {
            setIsLoading(false)
            if (isManual) {
                // Keep spinning for a bit for better UI feedback
                setTimeout(() => setIsRefreshing(false), 600)
            }
        }
    }, [])

    const createNewEmail = async (overrideDomain?: string) => {
        setIsGenerating(true)
        try {
            api.clearSession() // Clear old session first

            const domain = overrideDomain || selectedDomain || (await api.getDomains())[0]

            const session = await api.createAddress(domain)
            setEmailAddress(session.address)
            setCreatedAt(session.createdAt)
            setEmails([])
            setSelectedEmailId(null)

            // Connect socket for the new address
            api.connectSocket(handleNewEmail)
        } catch (e) {
            console.error('Failed to create email', e)
            alert('Failed to generate email address. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleLogout = () => {
        api.clearSession()
        setEmailAddress(null)
        setEmails([])
        setSelectedEmailId(null)
    }

    const handleSelectEmail = (id: string) => {
        setSelectedEmailId(id)
        setEmails((prev) =>
            prev.map((email) =>
                email.id === id
                    ? { ...email, isRead: true }
                    : email,
            ),
        )
    }

    const handleDeleteAddress = async () => {
        setIsConfirmOpen(true)
    }

    const confirmDeleteAddress = async () => {
        setIsGenerating(true)
        try {
            await api.deleteAddress()
            // Don't nullify emailAddress here to prevent UI flicker (hero section disappearing)
            // setEmailAddress(null) 
            setCreatedAt(null)
            setEmails([])
            setSelectedEmailId(null)
            createNewEmail()
        } catch (e) {
            console.error('Failed to delete address', e)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDomainChange = (newDomain: string) => {
        setSelectedDomain(newDomain)
        createNewEmail(newDomain)
    }

    // Auto-refresh fallback (every 5s) just in case socket misses something
    useEffect(() => {
        if (!emailAddress) return
        const interval = setInterval(() => {
            loadEmails()
        }, 5000) // Reduced from 1000ms to 5000ms for better performance
        return () => clearInterval(interval)
    }, [emailAddress])

    const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                            <Shield size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                            Temp<span className="text-cyan-500">Mail</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                        Disposable email for{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                            privacy
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Keep your real inbox clean and secure. Use our temporary email
                        service for verifications, sign-ups, and testing.
                    </p>
                </div>

                {/* Generator Section */}
                {emailAddress && (
                    <EmailGenerator
                        email={emailAddress}
                        createdAt={createdAt}
                        onGenerateNew={() => createNewEmail()}
                        onDelete={handleDeleteAddress}
                        isLoading={isGenerating}
                        domains={domains}
                        selectedDomain={selectedDomain}
                        onDomainChange={handleDomainChange}
                        onShowQR={() => setIsQRModalOpen(true)}
                    />
                )}

                {/* Features Grid (Small) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
                    {[
                        {
                            icon: Shield,
                            label: 'Private & Secure',
                            desc: 'No logs kept',
                        },
                        {
                            icon: Zap,
                            label: 'Instant',
                            desc: 'Real-time delivery',
                        },
                        {
                            icon: Lock,
                            label: 'Encrypted',
                            desc: 'End-to-end protection',
                        },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                            <div className="flex-shrink-0">
                                <feature.icon className="text-cyan-500" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                                    {feature.label}
                                </h3>
                                <p className="text-xs text-slate-500">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inbox Interface */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative">
                    <div
                        className={`md:col-span-5 lg:col-span-4 ${selectedEmailId ? 'hidden md:block' : 'block'}`}
                    >
                        <EmailInbox
                            emails={emails}
                            selectedId={selectedEmailId}
                            onSelectEmail={handleSelectEmail}
                            onRefresh={() => loadEmails(true)}
                            isLoading={isRefreshing}
                        />
                    </div>

                    <div
                        className={`md:col-span-7 lg:col-span-8 ${!selectedEmailId ? 'hidden md:block' : 'block'}`}
                    >
                        <AnimatePresence mode="wait">
                            <EmailDetail
                                key={selectedEmailId || 'empty'}
                                email={selectedEmail}
                                onClose={() => setSelectedEmailId(null)}
                            />
                        </AnimatePresence>
                    </div>
                </div>


                {/* Extended Landing Page Sections */}
                <div className="mt-24 space-y-0">
                    <FeatureGrid />
                    <Testimonials />
                    <FAQ />
                </div>
            </main >

            <footer className="py-8 text-center text-sm text-slate-400 dark:text-slate-600">
                <p>© {new Date().getFullYear()} TempMail. Secure. Private. Fast.</p>
            </footer>
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDeleteAddress}
                title="Delete Email Address?"
                message="Are you sure you want to delete this address? All incoming messages will be permanently lost."
                confirmLabel="Delete Address"
                isDestructive
            />
            <QRCodeModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                sessionUrl={`${window.location.origin}${window.location.pathname}?t=${encodeURIComponent(api.getSession()?.jwt || '')}&a=${encodeURIComponent(api.getSession()?.address || '')}&c=${api.getSession()?.createdAt || ''}`}
            />
        </div >
    )
}

export default App
