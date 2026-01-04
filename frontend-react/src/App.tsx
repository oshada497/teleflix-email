import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from './components/Layout'

// Lazy load all page components
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const BlogPage = lazy(() => import('./pages/Blog').then(m => ({ default: m.BlogPage })))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })))
const AboutPage = lazy(() => import('./pages/About').then(m => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('./pages/Contact').then(m => ({ default: m.ContactPage })))
const PrivacyPage = lazy(() => import('./pages/Privacy').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('./pages/Terms').then(m => ({ default: m.TermsPage })))
const DisclaimerPage = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.DisclaimerPage })))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicy').then(m => ({ default: m.CookiePolicyPage })))

// Loading fallback component
function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
    )
}

export function App() {
    return (
        <Router>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:id" element={<BlogPostPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/disclaimer" element={<DisclaimerPage />} />
                        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                    </Route>
                </Routes>
            </Suspense>
        </Router>
    )
}

export default App
