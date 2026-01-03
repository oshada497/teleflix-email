import { useState, useEffect, memo, useMemo } from 'react'
import { Copy, RefreshCw, Check, Trash2, Clock, QrCode } from 'lucide-react'
import { Button } from './ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

interface EmailGeneratorProps {
    email: string
    createdAt: number | null
    onGenerateNew: () => void
    onDelete: () => void
    isLoading?: boolean
    domains: string[]
    selectedDomain: string
    onDomainChange: (domain: string) => void
    onShowQR?: () => void
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
    const [copied, setCopied] = useState(false)
    const [timeLeft, setTimeLeft] = useState<string>('24:00:00')

    const handleCopy = () => {
        navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

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
            setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}`)
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
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
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
                                            {copied ? (
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

                        {/* Control Row: Domain | New | Delete */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {/* Domain Selector (Left) */}
                            <div className="flex-1 w-full sm:w-auto relative">
                                <select
                                    value={selectedDomain}
                                    onChange={(e) => onDomainChange(e.target.value)}
                                    className="w-full h-9 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 text-sm font-medium text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer text-center"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1em',
                                    }}
                                >
                                    {domains.map((dom) => (
                                        <option key={dom} value={dom}>
                                            @{dom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Generate New (Center) */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onGenerateNew}
                                isLoading={isLoading}
                                className="w-full sm:w-auto text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
                            >
                                {!isLoading && <RefreshCw size={16} className="mr-2" />}
                                Generate New
                            </Button>

                            {/* Delete (Right) */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                disabled={isLoading}
                                className="w-full sm:w-auto text-slate-400 hover:text-red-500"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Delete
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
