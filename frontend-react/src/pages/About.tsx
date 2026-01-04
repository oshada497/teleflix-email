export function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">About Us</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                <p className="lead text-xl mb-8">
                    We are dedicated to protecting your digital privacy in an increasingly connected world.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
                <p className="mb-6">
                    Our mission is simple: to provide a secure, fast, and reliable temporary email service that empowers individuals to control their personal information. We believe that privacy is a fundamental right, not a luxury.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Who We Are</h2>
                <p className="mb-6">
                    We are a team of cybersecurity enthusiasts, developers, and privacy advocates. Frustrated by the excessive amount of spam and data tracking online, we built TempMail to offer a robust solution for everyday users.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Choose Us?</h2>
                <ul className="list-disc pl-6 mb-8 space-y-2">
                    <li><strong>Anonymity:</strong> We do not log your activity or require any personal details.</li>
                    <li><strong>Speed:</strong> Our infrastructure is built for real-time email delivery.</li>
                    <li><strong>Security:</strong> We implement state-of-the-art encryption and security practices.</li>
                </ul>

                <p>
                    Whether you're testing software, signing up for a one-time service, or simply want to keep your primary inbox clean, we're here to help.
                </p>
            </div>
        </div>
    )
}
