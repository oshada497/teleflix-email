import React, { useEffect, useState } from 'react'
import { Moon, Sun, Shield, Zap, Lock } from 'lucide-react'
import { EmailGenerator } from './components/EmailGenerator'
import { EmailInbox } from './components/EmailInbox'
import { EmailDetail } from './components/EmailDetail'
import { generateRandomEmailAddress, generateMockEmail } from './utils/mockData'
import { Email } from './utils/types'
import { AnimatePresence } from 'framer-motion'

export function App() {
    const [isDark, setIsDark] = useState(false)
    const [emailAddress, setEmailAddress] = useState('')
    const [emails, setEmails] = useState<Email[]>([])
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)

    // Initialize
    useEffect(() => {
        // Check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDark(true)
        }

        // Generate initial email
        const savedEmail = localStorage.getItem('tempEmail')
        if (savedEmail) {
            setEmailAddress(savedEmail)
        } else {
            createNewEmail()
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

    // Auto-generate incoming emails
    useEffect(() => {
        if (!emailAddress) return

        const interval = setInterval(() => {
            if (Math.random() > 0.3) {
                // 70% chance to get an email
                const newEmail = generateMockEmail()
                setEmails((prev) => [newEmail, ...prev])
            }
        }, 10000) // Check every 10 seconds

        return () => clearInterval(interval)
    }, [emailAddress])

    const createNewEmail = () => {
        const newEmail = generateRandomEmailAddress()
        setEmailAddress(newEmail)
        localStorage.setItem('tempEmail', newEmail)
        setEmails([]) // Clear inbox for new address
        setSelectedEmailId(null)
    }

    const handleSelectEmail = (id: string) => {
        setSelectedEmailId(id)
        setEmails((prev) =>
            prev.map((email) =>
                email.id === id
                    ? {
                        ...email,
                        isRead: true,
                    }
                    : email,
            ),
        )
    }

    const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                            <Shield size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                            Temp<span className="text-cyan-500">Mail</span>
                        </span>
                    </div>

                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
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

                {/* Generator */}
                <EmailGenerator email={emailAddress} onGenerateNew={createNewEmail} />

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
                            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
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
