import { memo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, Clock, Lock, RefreshCw, Smile } from 'lucide-react'

const features = [
    {
        icon: Zap,
        title: 'Instant Generation',
        description: 'Create a temporary email address with just one click, no registration required'
    },
    {
        icon: Shield,
        title: 'Privacy & Security',
        description: 'Your personal information is never exposed, ensuring your online privacy'
    },
    {
        icon: Clock,
        title: 'Auto-Destruction',
        description: 'Emails can be deleted immediately after use or retained for up to 10 minutes'
    },
    {
        icon: Lock,
        title: 'Anonymous Usage',
        description: 'No personal details required, securely send and receive emails anonymously'
    },
    {
        icon: RefreshCw,
        title: 'Auto Refresh',
        description: 'The system automatically refreshes your inbox so you never miss an important email'
    },
    {
        icon: Smile,
        title: 'User-friendly',
        description: 'A clean and intuitive interface that is easy to use without any technical knowledge'
    }
]

function FeatureGridComponent() {
    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Background Decor - Static & Lightweight */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-cyan-500/5 blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Temp Mail?</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                        Experience the most secure and fastest temporary email service.
                        Designed for privacy, speed, and simplicity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/30 transition-colors duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white mb-6 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <feature.icon size={26} strokeWidth={1.5} />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-500 transition-colors duration-300">
                                    {feature.title}
                                </h3>

                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors duration-300">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const FeatureGrid = memo(FeatureGridComponent)
