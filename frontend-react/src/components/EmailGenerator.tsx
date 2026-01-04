import { useState, useRef, useEffect, memo } from 'react'
import { Copy, RefreshCw, Trash2, QrCode, ChevronDown, Check, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/Button'
import { Turnstile } from '@marsidev/react-turnstile'

const TURNSTILE_SITE_KEY = '0x4AAAAAACKeB7MPM8Eo6R-n'

interface EmailGeneratorProps {
    email: string | null
    createdAt: number | null
    onGenerateNew: (token?: string) => void
    onDelete: () => void
    isLoading: boolean
    domains: string[]
    selectedDomain: string
    onDomainChange: (domain: string) => void
    onShowQR: () => void
}

function EmailGeneratorComponent({
    email,
    createdAt,
    onGenerateNew,
    onDelete,
    isLoading,
    domains,
    selectedDomain,
    onDomainChange,
    onShowQR
}: EmailGeneratorProps) {
    const [timeLeft, setTimeLeft] = useState<string>('')
    const [hasCopied, setHasCopied] = useState(false)
    const [isDomainOpen, setIsDomainOpen] = useState(false)
    const [token, setToken] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleCopy = () => {
        if (email) {
            navigator.clipboard.writeText(email)
            setHasCopied(true)
            setTimeout(() => setHasCopied(false), 2000)
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDomainOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Timer Logic
    useEffect(() => {
        if (!createdAt) return

        const updateTimer = () => {
            const now = Date.now()
            const expiry = createdAt + 24 * 60 * 60 * 1000
            const diff = expiry - now

            if (diff <= 0) {
                setTimeLeft('00:00:00')
                return
            }

            const h = Math.floor(diff / (1000 * 60 * 60))
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const s = Math.floor((diff % (1000 * 60)) / 1000)

            const pad = (n: number) => n.toString().padStart(2, '0')
            setTimeLeft(pad(h) + ':' + pad(m) + ':' + pad(s))
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [createdAt])

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-300 dark:border-slate-800 p-6 md:p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                            Your Temporary Address
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Clock size={14} className="text-cyan-500" />
                            <span>Valid for: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{timeLeft}</span></span>
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="relative group w-full">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl transition-opacity opacity-50 group-hover:opacity-100" />
                            <div className="relative flex items-center justify-between bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-2 pr-2 transition-colors hover:border-cyan-500/30 dark:hover:border-cyan-500/30">
                                <div className="flex-1 px-4 py-2 overflow-hidden text-left">
                                    <motion.p
                                        key={email}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xl md:text-2xl font-mono text-slate-900 dark:text-slate-100 truncate font-medium"
                                    >
                                        {email}
                                    </motion.p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleCopy}
                                        variant="primary"
                                        className="min-w-[100px]"
                                        disabled={isLoading}
                                    >
                                        <AnimatePresence mode="wait">
                                            {hasCopied ? (
                                                <motion.div
                                                    key="check"
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.5, opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Check size={18} />
                                                    <span>Copied</span>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="copy"
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.5, opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Copy size={18} />
                                                    <span>Copy</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Domain Selection */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => !isLoading && setIsDomainOpen(!isDomainOpen)}
                                className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all ${isDomainOpen ? 'ring-2 ring-cyan-500/20 border-cyan-500' : 'hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                            >
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedDomain || 'Select Domain'}</span>
                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isDomainOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isDomainOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
                                    >
                                        {domains.map(domain => (
                                            <button
                                                key={domain}
                                                onClick={() => {
                                                    onDomainChange(domain)
                                                    setIsDomainOpen(false)
                                                }}
                                                className="w-full px-4 py-3 text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                            >
                                                {domain}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center">
                        <div className="flex-1 flex justify-center sm:justify-start min-h-[65px]">
                            <Turnstile
                                siteKey={TURNSTILE_SITE_KEY}
                                onSuccess={setToken}
                                options={{
                                    theme: 'auto',
                                    size: 'normal',
                                }}
                            />
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                onClick={() => {
                                    onGenerateNew(token || undefined)
                                }}
                                disabled={isLoading || !token}
                                className="flex-1 sm:flex-none relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center gap-2">
                                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                                    <span>Generate New</span>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={onDelete}
                                className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                            >
                                <Trash2 size={18} />
                            </Button>

                            <Button
                                variant="outline"
                                onClick={onShowQR}
                            >
                                <QrCode size={18} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center text-xs text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                            Active
                        </div>

                        {onShowQR && (
                            <button
                                onClick={onShowQR}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors uppercase tracking-tight"
                            >
                                <QrCode size={14} />
                                Sync to Mobile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const EmailGenerator = memo(EmailGeneratorComponent)
