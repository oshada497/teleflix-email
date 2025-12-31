import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Pencil, Check, Clock } from 'lucide-react'
import { Button } from './ui/Button'
import { ConfirmModal } from './ui/ConfirmModal'

interface HeroSectionProps {
    email: string
    isLoading: boolean
    onRefresh: (domain?: string) => void
    createdAt: number | null
    domains: string[]
    selectedDomain: string
    onDomainChange: (domain: string) => void
    onModalToggle?: (isOpen: boolean) => void
}

export function HeroSection({ email, isLoading, onRefresh, createdAt, domains, selectedDomain, onDomainChange, onModalToggle }: HeroSectionProps) {
    const [copied, setCopied] = useState(false)
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [pendingDomain, setPendingDomain] = useState<string | null>(null)

    useEffect(() => {
        if (onModalToggle) {
            onModalToggle(isConfirmOpen)
        }
    }, [isConfirmOpen, onModalToggle])

    // Countdown timer logic
    useEffect(() => {
        if (!createdAt) {
            setTimeLeft(24 * 60 * 60)
            return
        }

        const calculateTimeLeft = () => {
            const now = Date.now()
            const elapsed = Math.floor((now - createdAt) / 1000)
            const remaining = (24 * 60 * 60) - elapsed
            return remaining > 0 ? remaining : 0
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [createdAt, email])

    // Format seconds to HH:MM:SS
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleRefresh = () => {
        setPendingDomain(null);
        setIsConfirmOpen(true);
    }

    const handleDomainSelect = (domain: string) => {
        setPendingDomain(domain);
        setIsConfirmOpen(true);
    }

    const confirmRefresh = () => {
        if (pendingDomain) {
            onDomainChange(pendingDomain);
            setPendingDomain(null);
        } else {
            onRefresh();
        }
    }

    return (
        <section className="relative w-full max-w-4xl mx-auto px-4 pt-32 pb-12 text-center z-10">
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                    scale: 0.95
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                }}
                transition={{
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.3
                }}
            >
                <div className="inline-flex items-center justify-center px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Live Temporary Email
                </div>

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-white">
                    Temporary Email in{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                        Seconds
                    </span>
                </h1>

                <p className="text-lg text-secondary mb-10 max-w-xl mx-auto">
                    Secure, anonymous, and free. No registration required. Your inbox
                    auto-deletes in 24 hours.
                </p>

                {/* Email Input Box */}
                <div className="relative max-w-2xl mx-auto space-y-4">
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            className="relative flex flex-col md:flex-row items-center gap-3 p-2 bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
                        >
                            {/* Email Display */}
                            <div className="flex-1 w-full flex items-center min-w-0 bg-white/5 rounded-lg px-4 py-3 border border-white/5">
                                <motion.div
                                    animate={isLoading ? {} : { scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`h-2 w-2 rounded-full mr-3 shrink-0 ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}
                                ></motion.div>
                                <AnimatePresence mode="wait">
                                    <motion.input
                                        key={email}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        type="text"
                                        readOnly
                                        value={email}
                                        className="bg-transparent border-none text-white font-mono text-base md:text-lg focus:ring-0 placeholder-gray-500 w-full p-0"
                                    />
                                </AnimatePresence>

                                {/* Timer Badge for Desktop - Flex instead of Absolute */}
                                <div className="hidden md:flex items-center px-2 py-1 ml-3 rounded bg-white/5 border border-white/5 text-[10px] text-muted font-mono shrink-0">
                                    <Clock className="w-3 h-3 mr-1.5" />
                                    {formatTime(timeLeft)}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex w-full md:w-auto gap-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleCopy}
                                    className={`flex-1 md:flex-none min-w-[120px] transition-all duration-300 ${copied ? 'bg-green-600 hover:bg-green-700 ring-green-500/50' : ''}`}
                                    icon={
                                        copied ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )
                                    }
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>

                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handleRefresh}
                                    className="flex-none"
                                    aria-label="Generate new email"
                                >
                                    <Pencil
                                        className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`}
                                    />
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Domain Selection Dropdown Under the Bar */}
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-xs text-secondary uppercase tracking-widest font-semibold">Domain:</span>
                        <div className="relative group">
                            <select
                                value={selectedDomain}
                                onChange={(e) => handleDomainSelect(e.target.value)}
                                className="appearance-none bg-[#1a1a1a] border border-white/10 text-primary text-sm font-medium rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-white/5 transition-all duration-300"
                            >
                                {domains.map(d => (
                                    <option key={d} value={d} className="bg-[#1a1a1a] text-white">
                                        @{d}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Timer (below input) */}
                    <div className="md:hidden mt-3 flex justify-center">
                        <div className="flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted font-mono">
                            <Clock className="w-3 h-3 mr-2" />
                            Expires in {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

            </motion.div>
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => {
                    setIsConfirmOpen(false);
                    setPendingDomain(null);
                }}
                onConfirm={confirmRefresh}
                title={pendingDomain ? "Change Domain?" : "Change Email Address?"}
                message={
                    pendingDomain
                        ? `Are you sure you want to change your domain to @${pendingDomain}? Your current inbox will be permanently lost.`
                        : "Are you sure you want to generate a new email address? All emails in your current inbox will be permanently lost."
                }
                confirmLabel={pendingDomain ? "Change Domain" : "Change Address"}
            />
        </section >
    )
}
