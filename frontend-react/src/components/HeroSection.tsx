import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Pencil, Check, QrCode } from 'lucide-react'
import { Button } from './ui/Button'
import { CountdownTimer } from './CountdownTimer'

const QRCodeModal = lazy(() => import('./ui/QRCodeModal').then(m => ({ default: m.QRCodeModal })))
const ConfirmModal = lazy(() => import('./ui/ConfirmModal').then(m => ({ default: m.ConfirmModal })))

interface HeroSectionProps {
    email: string
    isLoading: boolean
    onRefresh: (domain?: string) => void
    createdAt: number | null
    domains: string[]
    selectedDomain: string
    onDomainChange: (domain: string) => void
}

export function HeroSection({ email, isLoading, onRefresh, createdAt, domains, selectedDomain, onDomainChange }: HeroSectionProps) {
    const [copied, setCopied] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)
    const [pendingDomain, setPendingDomain] = useState<string | null>(null)
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
                    duration: 0.5, // Faster entry
                    type: "tween", // Predictable entry for LCP
                    ease: "easeOut"
                }}
            >
                <div className="inline-flex items-center justify-center px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="hidden md:block animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
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
                            className="relative flex flex-col md:flex-row items-center gap-3 p-2 bg-[#1a1a1a]/80 backdrop-blur-md md:backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl transform-gpu"
                        >
                            {/* Email Display */}
                            <div className="flex-1 w-full flex flex-col md:flex-row items-center min-w-0 bg-white/5 rounded-lg px-4 py-3 md:py-3 border border-white/5">
                                <div className="flex items-center w-full md:w-auto">
                                    <motion.div
                                        className={`h-2 w-2 rounded-full mr-3 shrink-0 ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
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
                                </div>

                                <CountdownTimer createdAt={createdAt} email={email} />
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
                                    onClick={() => setIsQRModalOpen(true)}
                                    className="flex-none"
                                    aria-label="Show QR Code"
                                >
                                    <QrCode className="w-5 h-5" />
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

                    {/* CountdownTimer component handles mobile timer display */}
                </div>

            </motion.div>
            <Suspense fallback={null}>
                <QRCodeModal
                    email={email}
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                />
            </Suspense>
            <Suspense fallback={null}>
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
            </Suspense>
        </section >
    )
}
