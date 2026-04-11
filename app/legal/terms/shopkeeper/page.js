export default function ShopkeeperTerms() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12">
            <div className="container mx-auto px-4 max-w-3xl bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-orange-100 dark:border-slate-800">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Shopkeeper Agreement</h1>
                <p className="text-gray-500 dark:text-slate-400 mb-8">Last updated: January 2026</p>

                <div className="space-y-8 text-gray-700 dark:text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">1. Product Listing & Accuracy</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Shopkeepers must ensure all product descriptions, prices, and images are accurate and up-to-date.</li>
                            <li>Selling counterfeit, illegal, or prohibited items is strictly forbidden.</li>
                            <li>Stock levels must be maintained to avoid order cancellations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">2. Commission and Fees</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Style Genie charges a platform fee on each sale. The current fee structure is available in your dashboard.</li>
                            <li>Earnings are transferred to your registered bank account after the return period has passed.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">3. Order Fulfillment</h2>
                        <p>
                            Orders must be packed and marked as ready for pickup within 24 hours of receiving the order notification (excluding Sundays and holidays).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">4. Shop Management</h2>
                        <p>
                            You have the autonomy to manage your shop's branding and inventory, provided it aligns with Style Genie's community guidelines. We reserve the right to suspend shops that violate our policies.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
