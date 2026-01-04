import { Link } from 'react-router-dom'
import { Shield, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                                <Shield size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                                Temp<span className="text-cyan-500">Mail</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Protecting your digital identity with secure, anonymous, and instant temporary email services. No spam, no tracking, just privacy.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Quick Links</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link to="/blog" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">Blog</Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">Contact Us</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/cookie-policy" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">Cookie Policy</Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors">Disclaimer</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Connect</h3>
                        <ul className="space-y-4 text-sm mb-6">
                            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                                <Mail size={18} className="text-cyan-500 shrink-0 mt-0.5" />
                                <span>support@tempmail.com</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                                <MapPin size={18} className="text-cyan-500 shrink-0 mt-0.5" />
                                <span>123 Privacy Lane, Secure City, SC 98765</span>
                            </li>
                        </ul>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-cyan-500 hover:text-white transition-all duration-300">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-cyan-500 hover:text-white transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-cyan-500 hover:text-white transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-cyan-500 hover:text-white transition-all duration-300">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 dark:text-slate-500 text-sm text-center md:text-left">
                        © {currentYear} TempMail. All rights reserved.
                    </p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm flex items-center gap-1">
                        Made with <Heart size={14} className="text-red-500 fill-red-500" /> for privacy.
                    </p>
                </div>
            </div>
        </footer>
    )
}
