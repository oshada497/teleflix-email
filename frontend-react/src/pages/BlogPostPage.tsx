import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react'
import { blogPosts } from '../data/blogPosts'
import { useEffect } from 'react'

export function BlogPostPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const post = blogPosts.find(p => p.id === id)

    useEffect(() => {
        if (!post) {
            navigate('/blog')
        }
    }, [post, navigate])

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post?.title,
                text: post?.excerpt,
                url: window.location.href,
            })
        } else {
            // Fallback
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    if (!post) return null

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Back Link */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-500 transition-colors mb-8">
                    <ArrowLeft size={20} />
                    Back to Articles
                </Link>

                {/* Article Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-bold px-3 py-1 rounded-full">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between py-6 border-y border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    <User size={20} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{post.author}</p>
                                    <p className="text-xs text-slate-500">Author</p>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800" />
                            <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{post.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    <span>{post.readTime}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="rounded-2xl overflow-hidden mb-10 shadow-lg">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-auto object-cover max-h-[500px]"
                    />
                </div>

                {/* Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none">
                    {/* Manual Render for basic markdown-like structure without deps */}
                    {post.content.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                            return <h2 key={i} className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">{line.replace('## ', '')}</h2>
                        }
                        if (line.startsWith('### ')) {
                            return <h3 key={i} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3">{line.replace('### ', '')}</h3>
                        }
                        if (line.startsWith('* ')) {
                            return <li key={i} className="ml-4 list-disc text-slate-600 dark:text-slate-400 mb-2">{line.replace('* ', '')}</li>
                        }
                        if (line.match(/^\d+\./)) {
                            return <div key={i} className="ml-4 font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">{line}</div>
                        }
                        if (line.trim() === '') {
                            return <br key={i} />
                        }
                        return <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{line}</p>
                    })}
                </article>

            </div>
        </div>
    )
}
