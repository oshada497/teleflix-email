import { motion } from 'framer-motion'
import { Github, Globe, Info, Code2 } from 'lucide-react'

export function Navbar() {
    return (
        <nav className="fixed top-6 inset-x-0 z-[100] px-4">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="max-w-fit mx-auto flex items-center gap-2 p-1.5 bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
                {/* Logo Section */}
                <div className="flex items-center gap-2 pl-3 pr-4 border-r border-white/10">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                        S
                    </div>
                    <span className="font-bold text-sm tracking-tight text-white hidden sm:block">
                        SwiftMail
                    </span>
                </div>

                {/* Nav Links */}
                <div className="flex items-center gap-1 px-1">
                    <NavLink icon={<Globe className="w-4 h-4" />} label="Home" href="#" active />
                    <NavLink icon={<Code2 className="w-4 h-4" />} label="API" href="#" />
                    <NavLink icon={<Info className="w-4 h-4" />} label="About" href="#" />
                </div>

                {/* Actions */}
                <div className="pl-2 pr-1 border-l border-white/10 ml-1">
                    <a
                        href="https://github.com/oshada497/teleflix-email"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all duration-300"
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
        <a
            href={href}
            className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${active
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
            `}
        >
            {icon}
            <span className="hidden md:block">{label}</span>
        </a>
    )
}
