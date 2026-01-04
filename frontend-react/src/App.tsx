import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { BlogPage } from './pages/Blog'
import { BlogPostPage } from './pages/BlogPostPage'

export function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogPostPage />} />
            </Routes>
        </Router>
    )
}

export default App
