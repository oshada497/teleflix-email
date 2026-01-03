import { motion, AnimatePresence } from 'framer-motion'
import { X, QrCode, ShieldCheck, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface QRCodeModalProps {
    isOpen: boolean
    onClose: () => void
    sessionUrl: string
}

export function QRCodeModal({ isOpen, onClose, sessionUrl }: QRCodeModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg text-cyan-600">
                                        <QrCode size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Sync Inbox
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center mb-6">
                                    <QRCodeSVG
                                        value={sessionUrl}
                                        size={220}
                                        level="H"
                                        includeMargin
                                    />
                                </div>

                                <div className="space-y-4 w-full">
                                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <Smartphone size={18} className="text-cyan-500 mt-0.5" />
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            Scan this QR with your phone to open your temporary inbox instantly.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <ShieldCheck size={18} className="text-cyan-500 mt-0.5" />
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            Your session is private and encrypted. Scanning will securely sync your messages.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="mt-8 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
