import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
    {
        question: 'Is Temp Mail completely free?',
        answer: 'Yes, our service is 100% free to use. You can generate unlimited temporary email addresses without any cost or hidden fees.'
    },
    {
        question: 'Is it safe to use Temp Mail?',
        answer: 'Absolutely. We do not store your IP address or any personal data. Emails are encrypted and automatically deleted after a set period to ensure your privacy.'
    },
    {
        question: 'Can I use the same temp mail on multiple devices?',
        answer: 'Yes! You can sync your temporary email to mobile or other devices using the QR code feature available in your dashboard.'
    },
    {
        question: 'How long is the temp mail valid?',
        answer: 'Your temporary address is valid for 24 hours by default. You can renew it at any time if you need to keep it for longer.'
    },
    {
        question: 'Can I reply to emails received through Temp Mail?',
        answer: 'Currently, our service is receive-only to prevent abuse. You can read and download attachments, but cannot send outgoing emails.'
    }
]

function FAQComponent() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="py-12 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Temp Mail <span className="text-cyan-500">FAQ</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Check out the frequently asked questions about Temp Mail to better understand and use our service.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/50"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {faq.question}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                                </div>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-slate-500 dark:text-slate-500">
                        Still have questions? <a href="#" className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">Contact us</a> for more help.
                    </p>
                </div>
            </div>
        </section>
    )
}

export const FAQ = memo(FAQComponent)
