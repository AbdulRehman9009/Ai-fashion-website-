export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12">
            <div className="container mx-auto px-4 max-w-3xl bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-transparent dark:border-slate-800">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

                <div className="space-y-6 text-gray-600 dark:text-slate-400">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-3">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, update your profile, place an order, or communicate with us. This may include your name, email address, phone number, body measurements, and payment information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-3">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Process your orders and payments.</li>
                            <li>Connect you with tailors and delivery partners.</li>
                            <li>Generate AI-powered style recommendations.</li>
                            <li>Send you technical notices, updates, and support messages.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-3">3. Data Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-3">4. Cookies</h2>
                        <p>
                            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-3">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@example.com.
                        </p>
                    </section>
                </div>

                <div className="mt-12 text-sm text-gray-500 dark:text-slate-500 border-t dark:border-slate-800 pt-4">
                    Last updated: December 29, 2025
                </div>
            </div>
        </div>
    );
}
