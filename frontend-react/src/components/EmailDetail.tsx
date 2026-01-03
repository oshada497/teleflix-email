import { motion } from 'framer-motion'
import { X, Reply, Trash2, Download, Star } from 'lucide-react'
import { Email } from '../utils/types'
import { Button } from './ui/Button'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface EmailDetailProps {
    email: Email | null
    onClose: () => void
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
    if (!email) {
        return (
            <div className="hidden md:flex flex-col h-[600px] items-center justify-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-300 dark:border-slate-800 border-dashed p-12">
                <div className="w-64 h-64 mb-4">
                    <DotLottieReact
                        src="https://lottie.host/69f90986-e354-4d23-b91c-510b16b258c1/qflZLNtOXw.lottie"
                        loop
                        autoplay
                    />
                </div>
                <div className="text-center text-slate-400">
                    <p className="text-lg font-medium">Select an email to read</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{
                opacity: 0,
                x: 20,
            }}
            animate={{
                opacity: 1,
                x: 0,
            }}
            exit={{
                opacity: 0,
                x: 20,
            }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl h-[600px] flex flex-col overflow-hidden absolute inset-0 md:relative z-20 md:z-0"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex-1 pr-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-tight">
                        {email.subject}
                    </h2>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-cyan-600 dark:text-cyan-400">
                            {email.sender}
                        </span>
                        <span className="text-slate-400">&lt;{email.senderEmail}&gt;</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-xs text-slate-500 mr-auto">
                    {email.timestamp.toLocaleString()}
                </span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Reply size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Star size={16} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <Trash2 size={16} />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 email-content bg-white dark:bg-slate-900">
                <div
                    className="prose prose-slate dark:prose-invert max-w-none prose-a:text-cyan-600"
                    dangerouslySetInnerHTML={{
                        __html: email.content,
                    }}
                />

                {email.hasAttachments && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                            Attachments (2)
                        </h4>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center">
                                    <span className="text-xs font-bold">PDF</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        invoice.pdf
                                    </p>
                                    <p className="text-xs text-slate-500">2.4 MB</p>
                                </div>
                                <Download size={16} className="text-slate-400 ml-2" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
