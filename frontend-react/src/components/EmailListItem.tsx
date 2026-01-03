import { memo } from 'react'
import { motion } from 'framer-motion'
import { Paperclip, ChevronRight } from 'lucide-react'
import { Email } from '../utils/types'

interface EmailListItemProps {
    email: Email
    isSelected: boolean
    onClick: () => void
}

function EmailListItemComponent({
    email,
    isSelected,
    onClick,
}: EmailListItemProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={onClick}
            className={`
                group relative p-4 cursor-pointer border-b border-slate-300 dark:border-slate-700 last:border-0 transition-all hover:scale-[1.002]
                ${isSelected
                    ? 'bg-cyan-50/50 dark:bg-cyan-900/30'
                    : !email.isRead
                        ? 'bg-slate-50/80 dark:bg-slate-800/50'
                        : 'bg-white dark:bg-slate-900'}
                hover:bg-slate-50 dark:hover:bg-slate-800/70
            `}
        >
            {/* Unread Indicator */}
            {!email.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
            )}

            <div className="flex items-start gap-4">
                <div
                    className={`
          mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isSelected ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
        `}
                >
                    <span className="text-sm font-semibold">{email.sender[0]}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3
                            className={`text-sm font-medium truncate ${!email.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                            {email.sender}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                            {email.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>

                    <h4
                        className={`text-sm mb-1 truncate ${!email.isRead ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                        {email.subject}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-500 truncate pr-8">
                        {email.preview}
                    </p>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-2">
                    {email.hasAttachments && (
                        <Paperclip size={14} className="text-slate-400" />
                    )}
                    <ChevronRight
                        size={16}
                        className="text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                </div>
            </div>
        </motion.div>
    )
}

export const EmailListItem = memo(EmailListItemComponent)
