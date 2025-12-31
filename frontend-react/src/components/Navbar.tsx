import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import { Github, Globe, Info, Code2 } from 'lucide-react'

export function Navbar() {
    const { scrollY } = useScroll()
    const [hidden, setHidden] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        // Hide when scrolling down past 400px (around Inbox start), show when near the top
        if (latest > 400) {
            setHidden(true)
        } else {
            setHidden(false)
        }
    })

    return (
        <nav className="fixed top-6 inset-x-0 z-[100] px-6 pointer-events-none">
            <motion.div
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: -100, opacity: 0 }
                }}
                animate={hidden ? "hidden" : "visible"}
                initial="visible"
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto max-w-5xl w-full mx-auto flex items-center justify-between p-2 bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            >
                {/* Left: Logo Section */}
                <div className="flex items-center gap-2 pl-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                        S
                    </div>
                    <span className="font-bold text-base tracking-tight text-white hidden sm:block">
                        SwiftMail
                    </span>
                </div>

                {/* Center: Nav Links */}
                <div className="hidden md:flex items-center gap-2 px-2 bg-white/5 rounded-full py-1 border border-white/5">
                    <NavLink icon={<Globe className="w-4 h-4" />} label="Home" href="#" active />
                    <NavLink icon={<Code2 className="w-4 h-4" />} label="API" href="#" />
                    <NavLink icon={<Info className="w-4 h-4" />} label="About" href="#" />
                </div>

                {/* Right: Actions */}
                <div className="pr-2 flex items-center gap-3">
                    <div className="md:hidden flex items-center gap-1">
                        <NavLink icon={<Globe className="w-4 h-4" />} label="" href="#" active />
                        <NavLink icon={<Code2 className="w-4 h-4" />} label="" href="#" />
                    </div>
                    <a
                        href="https://github.com/oshada497/teleflix-email"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all duration-300 shadow-inner"
                    >
                        <Github className="w-4 h-4" />
                    </a>
                </div>
            </motion.div>
        </nav>
    )
}

function NavLink({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${active
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
            `}
        >
            {icon}
            <span className="hidden md:block">{label}</span>
        </motion.a>
    )
}
