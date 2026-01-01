import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/Navbar'
import { HeroSection } from '../components/HeroSection'
import { api } from '../services/api'

// Lazy load heavy components
const InboxSection = lazy(() => import('../components/InboxSection').then(m => ({ default: m.InboxSection })))
const FeaturesGrid = lazy(() => import('../components/FeaturesGrid').then(m => ({ default: m.FeaturesGrid })))
const FAQSection = lazy(() => import('../components/FAQSection').then(m => ({ default: m.FAQSection })))
const ArticlesSection = lazy(() => import('../components/ArticlesSection').then(m => ({ default: m.ArticlesSection })))

const LoadingSkeleton = () => (
    <div className="w-full max-w-4xl mx-auto p-8 animate-pulse">
        <div className="h-64 bg-white/5 rounded-2xl"></div>
    </div>
)

import { StructuredData } from '../components/SEO/StructuredData'

export function LandingPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [domains, setDomains] = useState<string[]>(["fbflix.online", "tempxmail.qzz.io", "teleflix.online"]);
    const [selectedDomain, setSelectedDomain] = useState<string>("fbflix.online");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const init = async () => {
            const fetchedDomains = await api.getDomains();
            setDomains(fetchedDomains);

            const stored = api.getAddress();
            const storedCreatedAt = api.getCreatedAt();

            if (stored) {
                setEmail(stored);
                setCreatedAt(storedCreatedAt);
                const domain = stored.split('@')[1];
                if (domain) setSelectedDomain(domain);
            } else if (fetchedDomains.length > 0) {
                // Pick a random domain for the first-time user
                const randomIndex = Math.floor(Math.random() * fetchedDomains.length);
                const randomDomain = fetchedDomains[randomIndex];
                setSelectedDomain(randomDomain);
                handleRefresh(randomDomain);
            }
        };
        init();
    }, []);

    const handleRefresh = async (domainOverride?: string) => {
        setIsLoading(true);
        try {
            const domainToUse = domainOverride || selectedDomain || (domains.length > 0 ? domains[0] : undefined);
            const { address } = await api.createAddress(domainToUse);
            setEmail(address);
            setCreatedAt(api.getCreatedAt());
            if (domainToUse) setSelectedDomain(domainToUse);
        } catch (e) {
            console.error("Failed to create address", e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <StructuredData />
            <div className="min-h-screen w-full bg-background text-white selection:bg-primary/30 overflow-x-hidden">
                {/* Background Gradients */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {!isMobile && (
                        <>
                            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[80px] rounded-full opacity-40 transform-gpu" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[400px] bg-purple-900/5 blur-[80px] rounded-full opacity-20 transform-gpu" />
                        </>
                    )}
                    {isMobile && (
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    )}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col min-h-screen">
                    {!isModalOpen && <Navbar isMobile={isMobile} />}

                    <main className="flex-1 flex flex-col items-center">
                        <HeroSection
                            email={email || 'Generating...'}
                            isLoading={isLoading}
                            onRefresh={handleRefresh}
                            createdAt={createdAt}
                            domains={domains}
                            selectedDomain={selectedDomain}
                            onDomainChange={(d) => {
                                setSelectedDomain(d);
                                handleRefresh(d);
                            }}
                            isMobile={isMobile}
                        />
                        <Suspense fallback={<LoadingSkeleton />}>
                            <InboxSection key={email} onModalToggle={setIsModalOpen} isMobile={isMobile} />
                        </Suspense>

                        <Suspense fallback={<div className="h-32" />}>
                            <motion.div
                                initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: isMobile ? 0.3 : 0.8, delay: isMobile ? 0 : 0.2 }}
                            >
                                <FeaturesGrid isMobile={isMobile} />
                            </motion.div>
                        </Suspense>

                        <Suspense fallback={<div className="h-32" />}>
                            <ArticlesSection />
                        </Suspense>

                        <Suspense fallback={<div className="h-32" />}>
                            <FAQSection isMobile={isMobile} />
                        </Suspense>
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
        </>
    )
}
