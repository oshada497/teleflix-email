import { useState, useEffect } from 'react'
import { HeroSection } from '../components/HeroSection'
import { InboxSection } from '../components/InboxSection'
import { FeaturesGrid } from '../components/FeaturesGrid'
import { Navbar } from '../components/Navbar'
import { api } from '../services/api'

export function LandingPage() {
    const [email, setEmail] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [domains, setDomains] = useState<string[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string>('');

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
        <div className="min-h-screen w-full bg-background text-white selection:bg-primary/30 overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-purple-900/10 blur-[100px] rounded-full opacity-30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

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
                    />
                    <InboxSection key={email} />
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
