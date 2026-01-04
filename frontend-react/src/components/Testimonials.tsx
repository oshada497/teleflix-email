import { memo } from 'react'
import { motion } from 'framer-motion'
import { Quote, Star, Shield, Zap, Lock } from 'lucide-react'

const testimonials = [
    {
        name: 'Alex Chen',
        role: 'Full Stack Developer',
        content: "Testing auth flows is a breeze now. I don't have to clutter my company email with test accounts anymore. Essential tool.",
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede'
    },
    {
        name: 'Jordan Miller',
        role: 'Privacy Advocate',
        content: "I used to drown in spam, but this tool kept my primary inbox pristine. Absolute lifesaver for signing up to random sites.",
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=b6e3f4'
    },
    {
        name: 'Sarah Jenkins',
        role: 'Digital Marketer',
        content: "Blazing fast and the UI is gorgeous. Hands down the most reliable disposable email service out there. Highly recommend!",
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf'
    },
    {
        name: 'David Kim',
        role: 'Security Researcher',
        content: "Perfect for privacy freaks like me. I no longer worry about my data being sold when I just want to read a single article.",
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=ffc6ff'
    },
    {
        name: 'Emily Davis',
        role: 'UX Designer',
        content: "The interface is so much better than the clunky alternatives. It actually feels like a premium app. Love the animations!",
        rating: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily&backgroundColor=ffd5dc'
    },
    {
        name: 'Michael Ross',
        role: 'Freelancer',
        content: "Been using this for months for all my one-time registrations. Zero spam in my main account since I started. 10/10.",
        rating: 4,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=d1d4f9'
    }
]

// Duplicate for infinite scroll
const reviews = [...testimonials, ...testimonials]

function TestimonialsComponent() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="container mx-auto px-4 mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Trusted by <span className="text-cyan-500">Thousands</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Join the community of developers, privacy advocates, and professionals who trust us with their temporary email needs.
                    </p>
                </motion.div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full mask-gradient-x">
                <div className="flex overflow-hidden py-4">
                    <motion.div
                        className="flex gap-6 px-3"
                        animate={{ x: "-50%" }}
                        transition={{
                            duration: 50,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop"
                        }}
                        style={{ width: "fit-content" }}
                    >
                        {reviews.map((review, index) => (
                            <div
                                key={`${review.name}-${index}`}
                                className="flex-shrink-0 w-[350px] md:w-[400px] p-8 rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-500/30"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300 dark:text-slate-600"}
                                        />
                                    ))}
                                </div>

                                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed relative z-10">
                                    "{review.content}"
                                </p>

                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</h4>
                                        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">{review.role}</p>
                                    </div>
                                    <Quote className="ml-auto text-slate-200 dark:text-slate-700" size={32} />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Gradient Overlays for smooth fade effect at edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Bottom Stats / Trust Indicators */}
            <div className="container mx-auto px-4 mt-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-12">
                    {[
                        { icon: Shield, label: "Private", value: "100%" },
                        { icon: Zap, label: "Speed", value: "<100ms" },
                        { icon: Lock, label: "Secure", value: "TLS 1.3" },
                        { icon: Quote, label: "Reviews", value: "5.0/5" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center group">
                            <div className="mx-auto w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center mb-3 text-cyan-600 dark:text-cyan-400 transition-transform group-hover:scale-110">
                                <stat.icon size={24} />
                            </div>
                            <div className="font-bold text-2xl text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const Testimonials = memo(TestimonialsComponent)

