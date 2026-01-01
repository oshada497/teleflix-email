import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: React.ReactNode;
}

const faqData: FAQItem[] = [
    {
        question: "1. What is temporary email?",
        answer: (
            <>
                Temporary email (also called disposable email, temp mail, or burner email) is an email address that automatically expires after <span className="text-white font-semibold">24 hours</span>. It allows you to receive emails without using your real email address, protecting your privacy and preventing spam. The email address is generated instantly, requires no registration, and all messages are automatically deleted after expiration.
            </>
        )
    },
    {
        question: "2. Is temp email safe to use?",
        answer: "Yes, temporary email is safe for most purposes like signing up for websites, downloading resources, accessing free trials, and verifying accounts. However, never use it for important accounts like banking, healthcare, government services, or work email. Our service is designed for privacy; we don't log your activity and all data is permanently purged."
    },
    {
        question: "3. How long does a temporary email last?",
        answer: (
            <>
                Every temporary email address on our service is guaranteed to last for <span className="text-white font-semibold">24 hours</span>. This provides ample time for any verification process, account setup, or reading long-form newsletters. After 24 hours, the address and all its messages are permanently deleted from our servers for your security.
            </>
        )
    },
    {
        question: "4. Do I need to create an account?",
        answer: "No! Teleflix Email requires no registration, no password, and no personal information. Simply visit our site, and a temporary email address is instantly generated for you. You can start receiving emails immediately."
    },
    {
        question: "5. Can I use temp email for Discord, Instagram, or Twitter?",
        answer: "Yes, temp email works with most social platforms including Discord and Twitter. While most services accept our domains, some like Instagram or Facebook may occasionally block disposable providers. If one domain doesn't work, try switching to another available domain from our dropdown."
    },
    {
        question: "6. Why didn't I receive my verification email?",
        answer: (
            <div className="space-y-2">
                <p>Our service is <span className="text-white font-semibold">extremely fast</span>. If an email hasn't arrived immediately:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Refresh the inbox or wait a few seconds (occasionally the sender's server may have a slight delay).</li>
                    <li>Check if the sender's service explicitly blocks disposable email providers.</li>
                    <li>Refresh to generate a new address or try a different domain from our list.</li>
                    <li>Ensure you copied the address exactly as shown.</li>
                </ul>
            </div>
        )
    },
    {
        question: "7. Is temp email legal?",
        answer: "Yes, using temporary email is completely legal. It is a legitimate privacy tool used by millions globally to avoid spam and maintain online anonymity. It should not be used for illegal activities, but for primary privacy protection, it is an essential tool."
    },
    {
        question: "8. What happens to my emails after they expire?",
        answer: (
            <>
                Following our strict 24-hour security policy, once an address expires, all associated emails are <span className="text-white font-semibold">permanently and non-recoverably deleted</span> from our D1 database. We do not keep backups or archives. If you have important information, please copy it before the 24-hour mark.
            </>
        )
    },
    {
        question: "9. Can someone else access my temp email?",
        answer: "Your privacy is our priority. Each email session is protected by a unique token stored in your browser. Unless someone has physical access to your device or your specific session URL, they cannot view your inbox."
    },
    {
        question: "10. Do you read my emails or sell my data?",
        answer: "Absolutely not. We do not read, scan, or analyze your emails. Our system is automated to deliver messages and then purge them. We don't sell data to third parties. Our platform is built on transparency and user trust."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const visibleFaqs = isExpanded ? faqData : faqData.slice(0, 5);

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-20 relative">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 mb-4">
                    <HelpCircle className="w-3 h-3" />
                    <span>Got Questions?</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                    Frequently Asked <span className="text-primary italic">Questions</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Everything you need to know about our temporary email service and how it protects your digital life.
                </p>
            </div>

            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {visibleFaqs.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: isExpanded ? 0 : index * 0.1 }}
                            className="group"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className={`w-full text-left p-5 md:p-6 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${openIndex === index
                                    ? 'bg-white/10 border-white/20 shadow-xl'
                                    : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                    }`}
                            >
                                <div className={`mt-1 p-2 rounded-lg transition-colors ${openIndex === index ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'
                                    }`}>
                                    <HelpCircle className="w-4 h-4" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className={`font-semibold text-lg transition-colors ${openIndex === index ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                            }`}>
                                            {item.question}
                                        </h3>
                                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 shrink-0 ${openIndex === index ? 'rotate-180 text-primary' : ''
                                            }`} />
                                    </div>

                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 text-gray-400 leading-relaxed text-base">
                                                    {item.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-medium text-gray-300 hover:text-white group"
                >
                    {isExpanded ? 'Show Less' : 'See More Questions'}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                </button>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full"></div>
            </div>
        </section>
    );
}
