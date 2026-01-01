import { motion } from 'framer-motion'
import { Shield, Zap, Clock, UserX } from 'lucide-react'

const features = [
    {
        icon: <Shield className="w-6 h-6 text-primary" />,
        title: 'Privacy Protected',
        description:
            "Your real email stays hidden. We don't track you or sell your data.",
    },
    {
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        title: 'Instant Delivery',
        description:
            'Emails arrive in milliseconds with our high-performance websocket connection.',
    },
    {
        icon: <Clock className="w-6 h-6 text-blue-400" />,
        title: 'Auto-Delete',
        description:
            'All emails and data are permanently wiped from our servers after 24 hours.',
    },
    {
        icon: <UserX className="w-6 h-6 text-purple-400" />,
        title: 'No Registration',
        description:
            'Start using immediately. No passwords, no sign-ups, no friction.',
    },
]

export function FeaturesGrid({ isMobile = false }: { isMobile?: boolean }) {
    return (
        <section className="w-full max-w-6xl mx-auto px-4 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={isMobile ? { opacity: 1, y: 0 } : {
                            opacity: 0,
                            y: 20,
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0,
                        }}
                        viewport={{
                            once: true,
                        }}
                        transition={isMobile ? { duration: 0 } : {
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                            duration: 0.8,
                        }}
                        whileHover={isMobile ? {} : {
                            y: -5,
                        }}
                        className="p-6 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {feature.title}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
