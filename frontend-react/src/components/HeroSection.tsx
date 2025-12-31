import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, RefreshCw, Check, Clock } from 'lucide-react'
import { Button } from './ui/Button'

export function HeroSection() {
    const [email, setEmail] = useState('hello@swiftmail.com')
    const [copied, setCopied] = useState(false)
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60) // 24 hours in seconds
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Countdown timer logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [])

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
        setIsRefreshing(true)
        // Simulate API call/generation delay
        setTimeout(() => {
            const randomStr = Math.random().toString(36).substring(7)
            setEmail(`${randomStr}@swiftmail.com`)
            setTimeLeft(24 * 60 * 60) // Reset timer
            setIsRefreshing(false)
        }, 600)
    }

    return (
        <section className="relative w-full max-w-4xl mx-auto px-4 pt-20 pb-12 text-center z-10">
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                    ease: 'easeOut',
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
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex flex-col md:flex-row items-center gap-3 p-2 bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
                        {/* Email Display */}
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div
                                    className={`h-2 w-2 rounded-full ${isRefreshing ? 'bg-yellow-500' : 'bg-green-500'}`}
                                ></div>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.input
                                    key={email}
                                    initial={{
                                        opacity: 0,
                                        y: 10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -10,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                    }}
                                    type="text"
                                    readOnly
                                    value={email}
                                    className="block w-full pl-10 pr-24 py-3 bg-transparent border-none text-white font-mono text-lg md:text-xl focus:ring-0 placeholder-gray-500"
                                />
                            </AnimatePresence>

                            {/* Timer Badge inside input on desktop */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center px-2 py-1 rounded bg-white/5 border border-white/5 text-xs text-muted font-mono">
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
                                <RefreshCw
                                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                            </Button>
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
        </section>
    )
}
