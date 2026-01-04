export function DisclaimerPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Disclaimer</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                <p className="mb-6">
                    The information provided by TempMail ("we," "us," or "our") on our website is for general informational purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">External Links Disclaimer</h2>
                <p className="mb-6">
                    The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site or any website or feature linked in any banner or other advertising.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Professional Disclaimer</h2>
                <p className="mb-6">
                    The Site cannot and does not contain legal advice. The legal information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of legal advice. The use or reliance of any information contained on the Site is solely at your own risk.
                </p>
            </div>
        </div>
    )
}
