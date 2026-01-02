import { useState } from 'react'
import { Copy, RefreshCw, Check } from 'lucide-react'
import { Button } from './ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

interface EmailGeneratorProps {
    email: string
    onGenerateNew: () => void
}

export function EmailGenerator({ email, onGenerateNew }: EmailGeneratorProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(email)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                            Your Temporary Address
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            This email will self-destruct when you leave
                        </p>
                    </div>

                    <div className="relative w-full group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl transition-opacity opacity-50 group-hover:opacity-100" />
                        <div className="relative flex items-center justify-between bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl p-2 pr-2 transition-colors hover:border-cyan-500/30 dark:hover:border-cyan-500/30">
                            <div className="flex-1 px-4 py-2 overflow-hidden">
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
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.div
                                                key="check"
                                                initial={{
                                                    scale: 0.5,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    scale: 0.5,
                                                    opacity: 0,
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Check size={18} />
                                                <span>Copied</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="copy"
                                                initial={{
                                                    scale: 0.5,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    scale: 0.5,
                                                    opacity: 0,
                                                }}
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

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onGenerateNew}
                            className="text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Generate New
                        </Button>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center text-xs text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                            Auto-refresh active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
