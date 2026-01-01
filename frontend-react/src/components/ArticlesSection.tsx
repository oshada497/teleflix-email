import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Calendar, Clock, Globe, Shield, Smartphone, Gamepad, Lock, Share2 } from 'lucide-react';

interface Article {
    id: number;
    title: string;
    date: string;
    description: string;
    image: string;
    icon: React.ReactNode;
    category: string;
}

const articles: Article[] = [
    {
        id: 1,
        title: "Private domains. How to get your own Temporary Email (2026)",
        date: "Jan 1, 2026",
        category: "Privacy",
        description: "How to create temporary email on your own private domain and how it helps you to bypass common issues with registrations.",
        image: "/article_private_domains_v2_1767251434462.png",
        icon: <Globe className="w-4 h-4" />
    },
    {
        id: 2,
        title: "How to receive SMS otp verification online in 5 min. Guide.",
        date: "Dec 28, 2025",
        category: "Security",
        description: "In this guide, we'll detail how to use a temporary phone number to receive one-time password (OTP) verification code texts.",
        image: "/article_sms_otp_v2_1767251470573.png",
        icon: <Smartphone className="w-4 h-4" />
    },
    {
        id: 3,
        title: "New Temp Mail app for Android (2026) - Pro Version",
        date: "Dec 25, 2025",
        category: "Mobile",
        description: "Read about the new features of Temp Mail mobile app for Android smartphones and tablets with enhanced privacy controls.",
        image: "/article_android_app_v2_1767251498704.png",
        icon: <Shield className="w-4 h-4" />
    },
    {
        id: 4,
        title: "Top mobile games for Android and anonymous registration",
        date: "Dec 20, 2025",
        category: "Gaming",
        description: "Mobile games are perfect when you have some spare time. Many best-selling projects require account verification. Stay safe.",
        image: "/article_mobile_games_v2_1767251531693.png",
        icon: <Gamepad className="w-4 h-4" />
    },
    {
        id: 5,
        title: "What is ransomware and how to protect yourself easily",
        date: "Dec 15, 2025",
        category: "Safety",
        description: "As technology actively develops, intruders use ever more sophisticated methods of stealing our money. Stay protected.",
        image: "/article_ransomware_security_v2_1767251559559.png",
        icon: <Lock className="w-4 h-4" />
    },
    {
        id: 6,
        title: "Disposable email for Social media (Facebook, Twitter, etc...)",
        date: "Dec 10, 2025",
        category: "Privacy",
        description: "Every time you want to create account on some forum or social media, like Facebook, you have to enter email information.",
        image: "/article_private_domains_v2_1767251434462.png", // Fallback to first high-quality image
        icon: <Share2 className="w-4 h-4" />
    }
];

export function ArticlesSection() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-24 relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Popular <span className="text-primary italic">Articles</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl text-lg">
                        Stay informed with our latest guides and tips on digital privacy, security, and temporary tools.
                    </p>
                </div>
                <button className="group flex items-center gap-2 text-primary hover:text-white transition-colors font-medium">
                    View all articles
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                    <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative flex flex-col bg-white/[0.03] border border-white/[0.08] hover:border-primary/30 transition-all duration-500 rounded-3xl overflow-hidden backdrop-blur-sm"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                            {/* Category Tag */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                                {article.icon}
                                {article.category}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {article.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    5 min read
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {article.title}
                            </h3>

                            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                {article.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-primary text-sm font-semibold group-hover:underline">Read Guide</span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </div>
                        </div>

                        {/* Hover Gradient Glow */}
                        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
        </section>
    );
}
