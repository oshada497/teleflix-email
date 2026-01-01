import { useState, useEffect, memo, useTransition } from 'react'
import DOMPurify from 'dompurify'
import { io } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Inbox, // For Account/Settings
    Search,
    Mail,
    RefreshCcw,
    Trash2,
    X,
    Download,
    CheckCircle2,
    Paperclip
} from 'lucide-react'
import { api } from '../services/api'
import { Button } from './ui/Button'
import { ConfirmModal } from './ui/ConfirmModal'

const PUSHER_URL = "https://swiftmail-pusher.onrender.com"

interface UIMail {
    id: number
    sender: string
    subject: string
    time: string
    fullDate: string
    unread: boolean
    bodyHtml?: string
    bodyText?: string
    raw?: any
    attachments?: any[]
}

interface InboxSectionProps {
    onModalToggle?: (isOpen: boolean) => void
    isMobile?: boolean
}

export function InboxSection({ onModalToggle, isMobile = false }: InboxSectionProps) {
    const [activeTab, setActiveTab] = useState('inbox') // inbox, outbox, compose, account
    const [emails, setEmails] = useState<UIMail[]>([])
    const [sentEmails, setSentEmails] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedEmail, setSelectedEmail] = useState<UIMail | null>(null)
    const [sanitizedBody, setSanitizedBody] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Compose State
    const [composeTo, setComposeTo] = useState('')
    const [composeSubject, setComposeSubject] = useState('')
    const [composeBody, setComposeBody] = useState('')
    const [sending, setSending] = useState(false)
    const [sendSuccess, setSendSuccess] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [emailToDelete, setEmailToDelete] = useState<number | null>(null)

    // settings
    const [settings, setSettings] = useState<any>(null)

    const fetchMails = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'inbox') {
                const rawMails = await api.getMails()
                const uiMails: UIMail[] = rawMails.map(m => ({
                    id: m.id,
                    sender: m.parsed?.from || 'Unknown',
                    subject: m.parsed?.subject || '(No Subject)',
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fullDate: new Date(m.created_at).toLocaleString(),
                    unread: true,
                    bodyHtml: m.parsed?.html,
                    bodyText: m.parsed?.text,
                    attachments: m.parsed?.attachments || []
                }))
                setEmails(uiMails)
            } else if (activeTab === 'outbox') {
                const sent = await api.getSendbox()
                setSentEmails(sent)
            } else if (activeTab === 'account') {
                const doms = await api.getDomains()
                setSettings({ domains: doms, address: api.getAddress() })
            }
        } catch (e) {
            console.error("Failed to fetch data", e)
        } finally {
            setIsLoading(false)
        }
    }

    // WebSocket Setup
    useEffect(() => {
        const address = api.getAddress()
        if (!address) return

        const socket = io(PUSHER_URL)

        socket.on('connect', () => {
            console.log("Connected to Pusher")
            socket.emit('join', address)
        })

        socket.on('new_email', () => {
            console.log("Push notification received! Fetching mails...")
            fetchMails()
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    // Global Event Listener for manual refresh (from HeroSection)
    useEffect(() => {
        const handleForceRefresh = () => {
            console.log("Manual refresh triggered!");
            fetchMails();
        }
        window.addEventListener('force-refresh', handleForceRefresh);
        return () => window.removeEventListener('force-refresh', handleForceRefresh);
    }, [activeTab])

    const [isVisible, setIsVisible] = useState(!document.hidden)

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden)
            if (!document.hidden && activeTab === 'inbox') {
                fetchMails() // Refresh immediately when user returns to tab
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [activeTab])

    useEffect(() => {
        if (onModalToggle) {
            onModalToggle(!!selectedEmail || deleteConfirmOpen)
        }
    }, [selectedEmail, deleteConfirmOpen, onModalToggle])

    const handleSelectEmail = (mail: UIMail) => {
        startTransition(() => {
            setSelectedEmail(mail);
            if (mail.bodyHtml) {
                const sanitized = DOMPurify.sanitize(
                    mail.bodyHtml.replace(/<a\s+(?![^>]*target=)/gi, '<a target="_blank" rel="noopener noreferrer" '),
                    {
                        ADD_ATTR: ['target'],
                        ALLOWED_TAGS: [
                            'a', 'b', 'i', 'u', 'strong', 'em', 'p', 'br', 'div', 'span',
                            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr',
                            'font', 'center', 'blockquote', 'pre', 'code'
                        ],
                        ALLOWED_ATTR: [
                            'href', 'src', 'alt', 'title', 'style', 'width', 'height', 'align',
                            'border', 'cellpadding', 'cellspacing', 'bgcolor', 'color', 'face', 'size'
                        ]
                    }
                );
                setSanitizedBody(sanitized);
            } else {
                setSanitizedBody(null);
            }
        });
    }

    useEffect(() => {
        if (!isVisible) return;

        fetchMails()
        // Removed background interval to save 100% of idle polling costs.
        // We now rely entirely on Push notifications (WebSockets).
    }, [activeTab, autoRefresh, isVisible])

    const handleDelete = (id: number) => {
        setEmailToDelete(id);
        setDeleteConfirmOpen(true);
    }

    const confirmDelete = async () => {
        if (emailToDelete !== null) {
            await api.deleteMail(emailToDelete);
            setSelectedEmail(null);
            fetchMails();
            setEmailToDelete(null);
        }
    }

    const handleSend = async () => {
        if (!composeTo || !composeSubject || !composeBody) return;
        setSending(true);
        try {
            const success = await api.sendMail(composeTo, composeSubject, composeBody);
            if (success) {
                setSendSuccess(true);
                setComposeTo('');
                setComposeSubject('');
                setComposeBody('');
                setTimeout(() => setSendSuccess(false), 3000);
            } else {
                alert('Failed to send mail');
            }
        } catch (e: any) {
            alert(`Error sending mail: ${e.message}`);
        } finally {
            setSending(false);
        }
    }

    const handleDownload = (mail: UIMail) => {
        const element = document.createElement("a");
        const file = new Blob([mail.bodyText || mail.bodyHtml || ''], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${mail.subject.replace(/[^a-z0-9]/gi, '_')}.eml`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    const handleDownloadAttachment = (att: any) => {
        const element = document.createElement("a");
        const file = new Blob([att.content], { type: att.mimeType });
        element.href = URL.createObjectURL(file);
        element.download = att.filename || 'attachment';
        document.body.appendChild(element);
        element.click();
    }

    return (
        <section className="w-full max-w-6xl mx-auto px-4 pb-20 relative">
            <motion.div
                initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isMobile ? { duration: 0.3 } : { duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="flex flex-col md:flex-row min-h-[600px] bg-[#1a1a1a]/95 md:bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl transform-gpu"
            >
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-[#151515]/80 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col">
                    <div className="mb-6 px-2">
                        <div className="h-8 w-full bg-white/5 rounded-lg flex items-center px-3 text-muted text-sm border border-white/5 focus-within:border-primary/50 transition-colors">
                            <Search className="w-4 h-4 mr-2 opacity-50" />
                            <input className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder-gray-500" placeholder="Filter..." />
                        </div>
                    </div>
                    <nav className="space-y-1 flex-1">
                        <SidebarItem
                            icon={<Inbox className="w-4 h-4" />}
                            label="Inbox"
                            active={activeTab === 'inbox'}
                            onClick={() => setActiveTab('inbox')}
                            badge={activeTab === 'inbox' ? emails.length : 0}
                        />

                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-[#1a1a1a]/40">
                    {/* Toolbar */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                        <h2 className="font-medium text-white capitalize">{activeTab.replace('_', ' ')}</h2>
                        <div className="flex items-center gap-4">
                            {activeTab === 'inbox' && (
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-muted">
                                    <input
                                        type="checkbox"
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                        className="rounded border-gray-600 bg-transparent focus:ring-primary"
                                    />
                                    Auto Refresh
                                </label>
                            )}
                            <button
                                onClick={fetchMails}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                title="Refresh"
                            >
                                <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="p-2 h-full"
                            >
                                {activeTab === 'inbox' && (
                                    <InboxList emails={emails} isLoading={isLoading || isPending} onSelect={handleSelectEmail} isMobile={isMobile} />
                                )}
                                {activeTab === 'outbox' && (
                                    <OutboxList emails={sentEmails} isLoading={isLoading} />
                                )}
                                {activeTab === 'compose' && (
                                    <div className="p-6 max-w-2xl mx-auto space-y-4">
                                        {sendSuccess && (
                                            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Email sent successfully!
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">To</label>
                                            <input value={composeTo} onChange={e => setComposeTo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50" placeholder="recipient@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Subject</label>
                                            <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50" placeholder="Enter subject" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Message</label>
                                            <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white min-h-[200px] focus:outline-none focus:border-primary/50 font-mono" placeholder="Write your message..." />
                                        </div>
                                        <Button onClick={handleSend} disabled={sending} className="w-full">
                                            {sending ? 'Sending...' : 'Send Email'}
                                        </Button>
                                    </div>
                                )}
                                {activeTab === 'account' && (
                                    <div className="p-6 text-center text-gray-400">
                                        <div className="p-4 bg-white/5 rounded-lg inline-block text-left min-w-[300px]">
                                            <h3 className="text-white font-bold mb-4">Account Details</h3>
                                            <p className="mb-2"><span className="text-gray-500">Address:</span> {settings?.address || api.getAddress()}</p>
                                            <p className="mb-2"><span className="text-gray-500">JWT Token:</span> <span className="text-xs font-mono truncate block max-w-[250px]">...</span>(Hidden)</p>
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <p className="text-xs">Available Domains: {settings?.domains?.join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Email View Modal */}
            <AnimatePresence>
                {selectedEmail && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => { setSelectedEmail(null); setSanitizedBody(null); }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-3xl bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 text-white">
                                <h2 className="text-lg font-bold truncate flex-1 mr-4">{selectedEmail.subject}</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(selectedEmail.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDownload(selectedEmail)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setSelectedEmail(null); setSanitizedBody(null); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-[#222] text-sm text-gray-300 border-b border-white/5 flex justify-between">
                                <div>
                                    <span className="font-bold text-white">From:</span> {selectedEmail.sender}
                                </div>
                                <div>{selectedEmail.fullDate}</div>
                            </div>

                            {/* Attachments Section */}
                            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                                <div className="p-3 bg-white/[0.02] border-b border-white/5 flex flex-wrap gap-2 text-sm text-gray-300 items-center">
                                    <span className="font-bold flex items-center mr-2 text-primary/80"><Paperclip className="w-3 h-3 mr-1" /> Attachments:</span>
                                    {selectedEmail.attachments.map((att: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => handleDownloadAttachment(att)}
                                            className="flex items-center gap-2 px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md transition-colors text-xs text-primary"
                                        >
                                            <Download className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{att.filename || 'Attachment'}</span>
                                            <span className="text-gray-500 ml-1">({Math.round((att.content?.length || 0) / 1024)}KB)</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px] text-gray-900 border-t border-gray-100">
                                {isPending ? (
                                    <div className="flex items-center justify-center h-full text-gray-400">Loading content...</div>
                                ) : (
                                    <>
                                        {selectedEmail.bodyHtml ? (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: sanitizedBody || '' }}
                                                className="prose max-w-none text-gray-900 prose-a:text-blue-600 prose-a:underline break-words"
                                            />
                                        ) : (
                                            <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm leading-relaxed break-all">
                                                {selectedEmail.bodyText?.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                                                    if (part.match(/https?:\/\/[^\s]+/)) {
                                                        return (
                                                            <a
                                                                key={i}
                                                                href={part}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 underline hover:text-blue-800"
                                                            >
                                                                {part}
                                                            </a>
                                                        );
                                                    }
                                                    return part;
                                                })}
                                            </pre>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Deletion Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Email?"
                message="Are you sure you want to delete this email? This action cannot be undone."
            />
        </section>
    )
}

const InboxItem = memo(({ email, index, onSelect, isMobile }: any) => (
    <motion.div
        key={email.id}
        initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={isMobile ? { duration: 0 } : { delay: index * 0.05 }}
        onClick={() => onSelect(email)}
        className="group flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/[0.04] border-l-2 border-transparent hover:border-primary"
    >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-medium text-white border border-white/10 shrink-0">
            {email.sender[0]}
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <div className="col-span-3 truncate text-white font-medium">{email.sender}</div>
            <div className="col-span-7 truncate text-gray-400">{email.subject}</div>
            <div className="col-span-2 text-right text-xs text-gray-600 font-mono">{email.time}</div>
        </div>
    </motion.div>
))

function InboxList({ emails, isLoading, onSelect, isMobile }: any) {
    if (isLoading && emails.length === 0) return <div className="p-4 text-center text-muted">Loading...</div>
    if (emails.length === 0) return <EmptyState />

    return (
        <div className="space-y-1">
            {emails.map((email: any, index: number) => (
                <InboxItem key={email.id} email={email} index={index} onSelect={onSelect} isMobile={isMobile} />
            ))}
        </div>
    )
}

function OutboxList({ emails, isLoading }: any) {
    if (isLoading && emails.length === 0) return <div className="p-4 text-center text-muted">Loading...</div>
    if (!emails || emails.length === 0) return <div className="p-8 text-center text-muted">No sent emails</div>

    return (
        <div className="space-y-1">
            {emails.map((email: any, index: number) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.02]"
                >
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-medium mb-1">To: {email.to_mail}</div>
                        <div className="text-gray-400 text-sm">{email.subject}</div>
                    </div>
                </motion.div>
            ))}
        </div>
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
