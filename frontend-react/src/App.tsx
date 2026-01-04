import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { BlogPage } from './pages/Blog'
import { BlogPostPage } from './pages/BlogPostPage'
import { AboutPage } from './pages/About'
import { ContactPage } from './pages/Contact'
import { PrivacyPage } from './pages/Privacy'
import { TermsPage } from './pages/Terms'
import { DisclaimerPage } from './pages/Disclaimer'
import { CookiePolicyPage } from './pages/CookiePolicy'

export function App() {
    return (
        <Router>
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
        </Router>
    )
}

export default App
