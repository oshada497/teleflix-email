import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Inbox,
    Settings,
    Search,
    Mail,
    RefreshCcw,
    Trash2,
    Archive,
    Star,
} from 'lucide-react'

// Mock Data
const MOCK_EMAILS = [
    {
        id: 1,
        sender: 'Netflix',
        subject: 'Finish setting up your account',
        time: '10:42 AM',
        unread: true,
    },
    {
        id: 2,
        sender: 'GitHub',
        subject: '[GitHub] Please verify your device',
        time: '09:15 AM',
        unread: false,
    },
    {
        id: 3,
        sender: 'Linear',
        subject: 'Login verification code: 123456',
        time: 'Yesterday',
        unread: false,
    },
]

export function InboxSection() {
    const [activeTab, setActiveTab] = useState('inbox')
    const [emails] = useState(MOCK_EMAILS)
    const [isLoading, setIsLoading] = useState(false)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 1000)
    }

    return (
        <section className="w-full max-w-6xl mx-auto px-4 pb-20">
            <motion.div
                initial={{
                    opacity: 0,
                    y: 40,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.8,
                    delay: 0.2,
                    ease: 'easeOut',
                }}
                className="flex flex-col md:flex-row h-[600px] bg-[#1a1a1a]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-[#151515]/80 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col">
                    <div className="mb-6 px-2">
                        <div className="h-8 w-full bg-white/5 rounded-lg flex items-center px-3 text-muted text-sm">
                            <Search className="w-4 h-4 mr-2 opacity-50" />
                            <span>Search...</span>
                        </div>
                    </div>

                    <nav className="space-y-1 flex-1">
                        <SidebarItem
                            icon={<Inbox className="w-4 h-4" />}
                            label="Inbox"
                            active={activeTab === 'inbox'}
                            onClick={() => setActiveTab('inbox')}
                            badge={emails.filter((e) => e.unread).length}
                        />
                        <SidebarItem
                            icon={<Star className="w-4 h-4" />}
                            label="Starred"
                            active={activeTab === 'starred'}
                            onClick={() => setActiveTab('starred')}
                        />
                        <SidebarItem
                            icon={<Archive className="w-4 h-4" />}
                            label="Archive"
                            active={activeTab === 'archive'}
                            onClick={() => setActiveTab('archive')}
                        />
                        <SidebarItem
                            icon={<Trash2 className="w-4 h-4" />}
                            label="Trash"
                            active={activeTab === 'trash'}
                            onClick={() => setActiveTab('trash')}
                        />
                    </nav>

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <SidebarItem
                            icon={<Settings className="w-4 h-4" />}
                            label="Settings"
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-[#1a1a1a]/40">
                    {/* Toolbar */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                        <h2 className="font-medium text-white">Inbox</h2>
                        <button
                            onClick={handleRefresh}
                            className={`p-2 rounded-md hover:bg-white/5 text-muted hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Email List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {isLoading ? (
                            <div className="space-y-2 p-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-16 bg-white/5 rounded-lg animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : emails.length > 0 ? (
                            <div className="space-y-1">
                                {emails.map((email, index) => (
                                    <motion.div
                                        key={email.id}
                                        initial={{
                                            opacity: 0,
                                            x: -10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            delay: index * 0.05,
                                        }}
                                        className={`group flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 ${email.unread ? 'bg-white/[0.03] border-l-2 border-primary' : 'hover:bg-white/[0.02] border-l-2 border-transparent'}`}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full ${email.unread ? 'bg-primary' : 'bg-transparent'}`}
                                        />
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-medium text-white border border-white/10">
                                            {email.sender[0]}
                                        </div>
                                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                            <div
                                                className={`col-span-3 truncate ${email.unread ? 'text-white font-medium' : 'text-gray-400'}`}
                                            >
                                                {email.sender}
                                            </div>
                                            <div
                                                className={`col-span-7 truncate ${email.unread ? 'text-gray-200' : 'text-gray-500'}`}
                                            >
                                                {email.subject}
                                            </div>
                                            <div className="col-span-2 text-right text-xs text-gray-600 font-mono">
                                                {email.time}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

function SidebarItem({ icon, label, active, onClick, badge }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${active ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>
            {badge > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                </span>
            )}
        </button>
    )
}

function EmptyState() {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 opacity-20" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">
                Your inbox is empty
            </h3>
            <p className="text-sm max-w-xs mx-auto">
                Emails sent to your temporary address will appear here instantly.
            </p>
        </div>
    )
}
