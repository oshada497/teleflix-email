

export function StructuredData() {
    const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is temporary email?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Temporary email (also called disposable email, temp mail, or burner email) is an email address that automatically expires after 24 hours. It allows you to receive emails without using your real email address, protecting your privacy and preventing spam."
                }
            },
            {
                "@type": "Question",
                "name": "Is temp email safe to use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, temporary email is safe for most purposes like signing up for websites, downloading resources, accessing free trials, and verifying accounts. However, never use it for important accounts like banking or healthcare."
                }
            }
        ]
    };

    const appData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "SwiftMail",
        "operatingSystem": "All",
        "applicationCategory": "UtilitiesApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Secure, anonymous, and free temporary email in seconds. No registration required."
    };

    return (
        <>
            <script type="application/ld+json">
                {JSON.stringify(faqData)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(appData)}
            </script>
        </>
    );
}
