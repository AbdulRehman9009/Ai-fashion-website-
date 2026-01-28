export default function TailorTerms() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl bg-white p-8 rounded-xl shadow-sm border border-purple-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tailor Partnership Agreement</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2026</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Services and Quality</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Tailors must deliver high-quality workmanship consistent with the standards of StyleGenie.</li>
                            <li>All orders must be completed within the agreed-upon timeframe.</li>
                            <li>Detailed measurements provided by customers must be strictly followed.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Earnings and Payouts</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Tailors earn a commission on each customized order as per the current rate card.</li>
                            <li>Payouts are processed weekly for all completed and accepted orders.</li>
                            <li>StyleGenie reserves the right to withhold payment in cases of unresolved customer disputes or poor quality.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Professional Conduct</h2>
                        <p>
                            Tailors are expected to maintain professional communication with customers and platform support. Harassment or abusive behavior will result in immediate termination of the partnership.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Independent Contractor Status</h2>
                        <p>
                            Tailors operate as independent contractors and are not employees of StyleGenie. You are responsible for your own taxes and insurance.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
