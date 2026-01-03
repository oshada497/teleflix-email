import { useState } from 'react'
import { Copy, RefreshCw, Check, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

interface EmailGeneratorProps {
    email: string
    onGenerateNew: () => void
    onDelete: () => void
    isLoading?: boolean
    domains: string[]
    selectedDomain: string
    onDomainChange: (domain: string) => void
}

export function EmailGenerator({
    email,
    onGenerateNew,
    onDelete,
    isLoading,
    domains,
    selectedDomain,
    onDomainChange
}: EmailGeneratorProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-300 dark:border-slate-800 p-6 md:p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                            Your Temporary Address
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Emails are available for 24 hours
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
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

                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="w-full md:flex-1">
                                <label className="sr-only">Select Domain</label>
                                <select
                                    value={selectedDomain}
                                    onChange={(e) => onDomainChange(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='C19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem center',
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

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    className="flex-1 md:flex-none border-slate-200 dark:border-slate-800"
                                    onClick={onGenerateNew}
                                    isLoading={isLoading}
                                >
                                    <RefreshCw size={18} className="mr-2" />
                                    New
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1 md:flex-none"
                                    onClick={onDelete}
                                    disabled={isLoading}
                                >
                                    <Trash2 size={18} className="mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center pt-2 gap-4">
                        <div className="flex items-center text-xs text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                            Status: Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
