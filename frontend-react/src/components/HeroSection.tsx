import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Pencil, Check, QrCode, RefreshCw, Trash2, ChevronDown } from 'lucide-react'
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
    isMobile?: boolean
}

export function HeroSection({
    email,
    isLoading,
    onRefresh,
    createdAt,
    domains,
    selectedDomain,
    onDomainChange,
    isMobile = false
}: HeroSectionProps) {
    const [copied, setCopied] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)
    const [pendingDomain, setPendingDomain] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
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

    const handleManualRefresh = () => {
        // Dispatch a custom event to refresh the inbox
        const event = new CustomEvent('force-refresh');
        window.dispatchEvent(event);

        // Visual feedback
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    }

    return (
        <section className="relative w-full max-w-4xl mx-auto px-4 pt-32 pb-12 text-center z-10">
            <div className="inline-flex items-center justify-center px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide uppercase">
                <span className="relative flex h-2 w-2 mr-2">
                    {!isMobile && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    )}
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

                        {/* Actions - Hidden on Mobile, shown on Desktop */}
                        <div className="hidden md:flex w-full md:w-auto gap-2">
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
                <div className="flex flex-col gap-6">
                    {/* Optimized Mobile Grid / Desktop Flex Bar */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 items-center justify-center gap-2 md:gap-3">
                        <button
                            onClick={handleCopy}
                            aria-label="Copy email address"
                            className="group flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                        >
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-primary" />}
                            </div>
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white w-12 text-left">
                                {copied ? 'Copied' : 'Copy'}
                            </span>
                        </button>

                        <button
                            onClick={handleManualRefresh}
                            aria-label="Refresh inbox"
                            className="group flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                        >
                            <RefreshCw className={`w-4 h-4 text-primary transition-all duration-500 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white">Refresh</span>
                        </button>

                        <div className="relative group/change col-span-2 lg:col-span-1">
                            <select
                                value={selectedDomain}
                                onChange={(e) => handleDomainSelect(e.target.value)}
                                aria-label="Select email domain"
                                className="w-full appearance-none bg-white/5 border border-white/10 text-gray-300 text-sm font-medium rounded-xl pl-12 pr-10 py-3 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 cursor-pointer focus:outline-none backdrop-blur-sm z-10"
                            >
                                {domains.map(d => (
                                    <option key={d} value={d} className="bg-[#1a1a1a] text-white">
                                        @{d}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Pencil className="w-4 h-4 text-primary" />
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </div>
                        </div>

                        <button
                            onClick={handleRefresh}
                            aria-label="Delete current email address and generate new one"
                            className="group flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 backdrop-blur-sm col-span-2 lg:col-span-1"
                        >
                            <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white">New Address</span>
                        </button>
                    </div>

                    {/* QR Code Quick Button */}
                    <button
                        onClick={() => setIsQRModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 self-center px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs"
                    >
                        <QrCode className="w-3 h-3" />
                        Show QR Code
                    </button>
                </div>

                {/* CountdownTimer component handles mobile timer display */}
            </div>

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
        </section>
    )
}
