import { HeroSection } from '../components/HeroSection'
import { InboxSection } from '../components/InboxSection'
import { FeaturesGrid } from '../components/FeaturesGrid'

export function LandingPage() {
    return (
        <div className="min-h-screen w-full bg-background text-white selection:bg-primary/30 overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-purple-900/10 blur-[100px] rounded-full opacity-30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navbar */}
                <header className="w-full border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                S
                            </div>
                            <span className="font-bold text-lg tracking-tight">
                                SwiftMail
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block"
                            >
                                API
                            </a>
                            <a
                                href="#"
                                className="text-sm text-gray-400 hover:text-white transition-colors hidden md:block"
                            >
                                About
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center">
                    <HeroSection />
                    <InboxSection />
                    <FeaturesGrid />
                </main>

                {/* Footer */}
                <footer className="border-t border-white/5 py-12 bg-[#0f0f0f]">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} SwiftMail. Built for privacy.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    )
}
