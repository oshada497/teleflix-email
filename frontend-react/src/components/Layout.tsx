import { Outlet, Link, useLocation } from 'react-router-dom'
import { Shield, Sun, Moon, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Footer } from './Footer'

export function Layout() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme')
            if (saved) return saved === 'dark'
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return false
    })
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [isDark])

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0)
        setIsMenuOpen(false)
    }, [location.pathname])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                            <Shield size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                            Temp<span className="text-cyan-500">Mail</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-500'}`}>
                            Home
                        </Link>
                        <Link to="/blog" className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/blog') ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-500'}`}>
                            Blog
                        </Link>
                        <Link to="/about" className={`text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-cyan-500' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-500'}`}>
                            About
                        </Link>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 dark:text-slate-400"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <nav className="flex flex-col p-4 space-y-4">
                            <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 font-medium">Home</Link>
                            <Link to="/blog" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 font-medium">Blog</Link>
                            <Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 font-medium">About</Link>
                            <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-cyan-500 font-medium">Contact</Link>
                        </nav>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                <Outlet context={{ isDark }} />
            </main>

            <Footer />
        </div>
    )
}
