import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Shield, Moon, Sun, Search } from 'lucide-react'
import { blogPosts } from '../data/blogPosts'
import { useState, useEffect } from 'react'

export function BlogPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme')
        if (saved) return saved === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    // Toggle Dark Mode
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [isDark])


    const filteredPosts = blogPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header - Replicated for consistency */}
            <header className="sticky top-0 z-30 w-full border-b border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                            <Shield size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                            Temp<span className="text-cyan-500">Mail</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 relative z-10">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Blog</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg mb-8 relative z-10">
                        Insights, updates, and guides on privacy, security, and temporary email services.
                    </p>

                    <div className="max-w-md mx-auto relative z-10">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </div>
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {filteredPosts.map((post) => (
                        <article
                            key={post.id}
                            className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:border-cyan-500/30"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-cyan-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {post.category}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{post.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-cyan-500 transition-colors">
                                    {post.title}
                                </h3>

                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                            <User size={14} className="text-slate-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {post.author}
                                        </span>
                                    </div>
                                    <span className="text-cyan-500 text-sm font-medium group-hover:underline">Read More</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">No posts found matching "{searchTerm}"</p>
                    </div>
                )}

                <div className="mt-16 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>
                </div>
            </main>

            <footer className="py-8 text-center text-sm text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800 mt-12">
                <p>© {new Date().getFullYear()} TempMail. Secure. Private. Fast.</p>
            </footer>
        </div>
    )
}
