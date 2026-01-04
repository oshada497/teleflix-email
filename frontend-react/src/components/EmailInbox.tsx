import { memo, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Inbox, RefreshCw } from 'lucide-react'
import { Email } from '../utils/types'
import { EmailListItem } from './EmailListItem'

// Lazy load the Lottie player
const DotLottieReact = lazy(() =>
    import('@lottiefiles/dotlottie-react').then(module => ({
        default: module.DotLottieReact
    }))
)

interface EmailInboxProps {
    emails: Email[]
    selectedId: string | null
    onSelectEmail: (id: string) => void
    onRefresh?: () => void
    isLoading?: boolean
}

function EmailInboxComponent({
    emails,
    selectedId,
    onSelectEmail,
    onRefresh,
    isLoading,
}: EmailInboxProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm h-[600px] flex flex-col">
            {/* Header - Always Visible */}
            <div className="p-4 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between w-full">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Inbox size={18} className="text-cyan-500" />
                        <span>Inbox</span>
                        <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                            {emails.length} messages
                        </span>
                    </h3>

                    {onRefresh && (
                        <motion.button
                            onClick={onRefresh}
                            disabled={isLoading}
                            whileTap="tap"
                            className={`p-2 rounded-lg transition-colors duration-300 ${isLoading
                                ? 'text-cyan-500'
                                : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            title="Refresh Inbox"
                        >
                            <motion.div
                                variants={{ tap: { rotate: 180, scale: 0.9 } }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className={isLoading ? 'animate-spin' : ''}
                            >
                                <RefreshCw size={18} />
                            </motion.div>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="w-48 h-48 mb-2 relative flex items-center justify-center">
                            <Suspense fallback={
                                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                            }>
                                <DotLottieReact
                                    src="https://lottie.host/69f90986-e354-4d23-b91c-510b16b258c1/qflZLNtOXw.lottie"
                                    loop
                                    autoplay
                                    className="w-full h-full"
                                />
                            </Suspense>
                        </div>
                        <p className="font-medium text-lg">Your inbox is empty</p>
                        <p className="text-sm mt-1">Waiting for incoming messages...</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto h-full custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {emails.map((email) => (
                                <EmailListItem
                                    key={email.id}
                                    email={email}
                                    isSelected={selectedId === email.id}
                                    onClick={() => onSelectEmail(email.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}

export const EmailInbox = memo(EmailInboxComponent)
