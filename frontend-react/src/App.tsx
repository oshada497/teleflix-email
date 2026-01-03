import { useEffect, useState, useCallback } from 'react'
import { Moon, Sun, Shield, Zap, Lock, LogOut } from 'lucide-react'
import { EmailGenerator } from './components/EmailGenerator'
import { EmailInbox } from './components/EmailInbox'
import { EmailDetail } from './components/EmailDetail'
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
    const [isGenerating, setIsGenerating] = useState(false)
    const [domains, setDomains] = useState<string[]>([])
    const [selectedDomain, setSelectedDomain] = useState<string>('')
    const [createdAt, setCreatedAt] = useState<number | null>(null)

    // Initialize
    useEffect(() => {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDark(true)
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

    const loadEmails = async () => {
        setIsLoading(true)
        try {
            const fetched = await api.getMails(50)
            setEmails(fetched)
        } catch (e) {
            console.error('Failed to load emails', e)
        } finally {
            setIsLoading(false)
        }
    }

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
        if (!confirm('Are you sure you want to delete this email address and all its messages?')) return
        try {
            await api.deleteAddress()
            setEmailAddress(null)
            setCreatedAt(null)
            setEmails([])
            setSelectedEmailId(null)
            createNewEmail()
        } catch (e) {
            console.error('Failed to delete address', e)
            alert('Failed to delete address.')
        }
    }

    const handleDomainChange = (newDomain: string) => {
        setSelectedDomain(newDomain)
        createNewEmail(newDomain)
    }

    // Auto-refresh fallback (every 30s) just in case socket misses something
    useEffect(() => {
        if (!emailAddress) return
        const interval = setInterval(() => {
            loadEmails()
        }, 30000)
        return () => clearInterval(interval)
    }, [emailAddress])

    const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                WipeMyMail
                            </h1>
                            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest leading-none">
                                Teleflix Edition
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="space-y-12">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-4"
                        >
                            <Zap size={14} />
                            Powered by Cloudflare
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Disposable <span className="text-cyan-600 dark:text-cyan-400">Secure</span> Email
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Protect your privacy and keep your real inbox clean from spam, trackers, and bots.
                            Completely free and instant.
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
                        />
                    )}
                </div>

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
                            <feature.icon className="text-cyan-500" size={20} />
                            <div>
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
            </main>

            <footer className="py-8 text-center text-sm text-slate-400 dark:text-slate-600">
                <p>© {new Date().getFullYear()} TempMail. Secure. Private. Fast.</p>
            </footer>
        </div>
    )
}

export default App
