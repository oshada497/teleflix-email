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
        <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        What is <span className="text-cyan-500">Temp Mail?</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Temp Mail is a free online temporary email service that provides users with an instant disposable email address.
                        Our mission is to offer a simple and effective privacy protection solution for your online activities in today's complex digital world.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon size={24} strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const FeatureGrid = memo(FeatureGridComponent)
