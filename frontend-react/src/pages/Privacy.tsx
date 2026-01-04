export function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
            <p className="text-slate-500 text-sm mb-8">Last Updated: January 4, 2026</p>

            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                <p>
                    Your privacy is critically important to us. At TempMail, we have a few fundamental principles:
                </p>
                <ul className="list-disc pl-6 mb-6">
                    <li>We don't ask you for personal information unless we truly need it.</li>
                    <li>We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
                    <li>We don't store personal information on our servers unless required for the on-going operation of one of our services.</li>
                </ul>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                    <strong>Log Data:</strong> Like most website operators, TempMail collects non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request.
                </p>
                <p className="mb-4">
                    <strong>Emails:</strong> The content of emails received at temporary addresses is stored temporarily in our system RAM or volatile storage to display it to you. This data is automatically purged after a set period or when the session ends.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Use of Data</h2>
                <p className="mb-4">
                    We use the collected information primarily to operate and maintain the Service, improve user experience, and monitor usage statistics. We do not sell your data to third parties.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Cookies</h2>
                <p className="mb-4">
                    A cookie is a string of information that a website stores on a visitor's computer, and that the visitor's browser provides to the website each time the visitor returns. TempMail uses cookies to help identifying and track visitors, their usage of TempMail website, and their website access preferences. Visitors who do not wish to have cookies placed on their computers should set their browsers to refuse cookies before using TempMail's websites.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Third-Party Ads</h2>
                <p className="mb-4">
                    Ads appearing on any of our websites may be delivered to users by advertising partners, who may set cookies. These cookies allow the ad server to recognize your computer each time they send you an online advertisement to compile information about you or others who use your computer. This information allows ad networks to, among other things, deliver targeted advertisements that they believe will be of most interest to you. This Privacy Policy covers the use of cookies by TempMail and does not cover the use of cookies by any advertisers.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. GDPR Compliance</h2>
                <p className="mb-4">
                    If you are a resident of the European Economic Area (EEA), you have certain data protection rights. TempMail aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
                </p>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Changes to This Policy</h2>
                <p className="mb-4">
                    TempMail may change its Privacy Policy from time to time, and in TempMail's sole discretion. We encourage visitors to frequently check this page for any changes to protection. Your continued use of this site after any change in this Privacy Policy will constitute your acceptance of such change.
                </p>
            </div>
        </div>
    )
}
