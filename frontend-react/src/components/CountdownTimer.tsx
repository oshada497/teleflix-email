import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
    createdAt: number | null
    email: string
}

export function CountdownTimer({ createdAt, email }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60)

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

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <>
            {/* Desktop Timer */}
            <div className="hidden md:flex items-center px-2 py-1 ml-3 rounded bg-white/5 border border-white/5 text-[10px] text-muted font-mono shrink-0">
                <Clock className="w-3 h-3 mr-1.5" />
                {formatTime(timeLeft)}
            </div>

            {/* Mobile Timer */}
            <div className="md:hidden mt-3 flex justify-center">
                <div className="flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted font-mono">
                    <Clock className="w-3 h-3 mr-2" />
                    Expires in {formatTime(timeLeft)}
                </div>
            </div>
        </>
    )
}
