import { memo } from 'react'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const reviews = [
    {
        name: 'John',
        role: 'Freelancer',
        content: 'Temp Mail has completely changed my online experience. No more spam emails!',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=b6e3f4'
    },
    {
        name: 'Sarah',
        role: 'Software Engineer',
        content: 'As a developer, Temp Mail makes my testing workflow much easier. Highly recommended!',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=c0aede'
    },
    {
        name: 'Carlos',
        role: 'Digital Marketing Expert',
        content: 'Simple, fast, and efficient. Temp Mail is the best temporary email service I\'ve used.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=ffdfbf'
    }
]

function TestimonialsComponent() {
    return (
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        User <span className="text-cyan-500">Reviews</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        See what our users say about Temp Mail and how it helps them protect their privacy and improve efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-colors"
                        >
                            <Quote className="text-cyan-500 mb-6 opacity-50" size={40} />
                            <p className="text-slate-700 dark:text-slate-300 mb-6 italic min-h-[80px]">
                                "{review.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{review.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Social Proof Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center gap-4"
                >
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Join over <span className="text-cyan-600 dark:text-cyan-400 font-bold">100,000</span> users and make your online life safer, simpler, and more enjoyable!
                    </p>
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}&backgroundColor=random`}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export const Testimonials = memo(TestimonialsComponent)
