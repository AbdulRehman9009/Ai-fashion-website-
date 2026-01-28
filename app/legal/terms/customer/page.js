export default function CustomerTerms() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2026</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Ordering and Payments</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All orders must be paid in full at the time of purchase.</li>
                            <li>Prices for products are set by the respective shop owners.</li>
                            <li>Custom tailoring requests are subject to approval by the tailor.</li>
                            <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Returns and Refunds</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Standard products may be returned within 14 days of delivery if unused and in original packaging.</li>
                            <li>Custom-tailored items are generally non-refundable unless there is a defect or significant deviation from the provided measurements.</li>
                            <li>Refunds will be processed to the original method of payment.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
                        <p>
                            You agree not to use the platform for any illegal or unauthorized purpose. You must not transmit any worms or viruses or any code of a destructive nature.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Measurements</h2>
                        <p>
                            Users are responsible for providing accurate measurements for tailoring services. We provide a measurement guide, but we are not liable for ill-fitting garments resulting from incorrect measurements provided by the user.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
