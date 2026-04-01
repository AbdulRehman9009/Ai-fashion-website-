export default function DeliveryTerms() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl bg-white p-8 rounded-xl shadow-sm border border-green-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Partner Terms</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2026</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Delivery Standards</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Partners must maximize efficiency and deliver packages within the estimated timeframe.</li>
                            <li>Care must be taken to ensure packages are not damaged during transit.</li>
                            <li>Professional conduct is required when interacting with shopkeepers and customers.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Compensation</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Delivery fees are calculated based on distance and order weight.</li>
                            <li>Bonuses may be available for high performance or during peak times.</li>
                            <li>Payments are processed weekly.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Vehicle and Safety</h2>
                        <p>
                            You are responsible for maintaining your delivery vehicle and ensuring it meets all legal requirements. You must adhere to all traffic laws and safety regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Liability</h2>
                        <p>
                            Style Genie is not liable for any traffic violations or accidents that occur during delivery. Partners are independent contractors and must have their own insurance.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
