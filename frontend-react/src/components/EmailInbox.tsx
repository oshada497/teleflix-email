import { AnimatePresence } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { Email } from '../utils/types'
import { EmailListItem } from './EmailListItem'

interface EmailInboxProps {
    emails: Email[]
    selectedId: string | null
    onSelectEmail: (id: string) => void
}

export function EmailInbox({
    emails,
    selectedId,
    onSelectEmail,
}: EmailInboxProps) {
    if (emails.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Inbox size={32} className="opacity-50" />
                </div>
                <p className="font-medium">Your inbox is empty</p>
                <p className="text-sm mt-1">Waiting for incoming messages...</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm h-[600px] flex flex-col">
            <div className="p-4 border-b-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Inbox size={18} className="text-cyan-500" />
                    Inbox
                    <span className="ml-auto text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        {emails.length} messages
                    </span>
                </h3>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
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
        </div>
    )
}
