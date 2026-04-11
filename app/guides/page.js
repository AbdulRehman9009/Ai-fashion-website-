import { Ruler, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Measurement Guides - Style Genie",
    description: "Learn how to take accurate body measurements for perfectly fitted custom clothing.",
};

export default function GuidesPage() {
    const guides = [
        {
            title: "Shirts & Tops",
            measurements: ["Chest", "Shoulder Width", "Sleeve Length", "Neck", "Torso Length"],
            tips: "Measure with arms relaxed at your sides. Keep the tape level and snug but not tight."
        },
        {
            title: "Trousers & Pants",
            measurements: ["Waist", "Hips", "Inseam", "Outseam", "Thigh"],
            tips: "Wear thin clothing while measuring. Stand straight with weight evenly distributed."
        },
        {
            title: "Dresses & Gowns",
            measurements: ["Bust", "Waist", "Hips", "Shoulder to Floor", "Arm Length"],
            tips: "Wear the undergarments you plan to wear with the final outfit for accurate measurements."
        },
        {
            title: "Suits & Blazers",
            measurements: ["Chest", "Waist", "Shoulder", "Sleeve", "Back Length", "Jacket Length"],
            tips: "For suits, add a finger's width of ease to chest measurements for comfort."
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                        <Ruler className="h-4 w-4" />
                        Measurement Guides
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        How to Measure for the Perfect Fit
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Accurate measurements are the foundation of custom-tailored clothing. Follow these guides for a perfect fit every time.
                    </p>
                </div>
            </section>

            {/* General Tips */}
            <section className="pb-12">
                <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 lg:p-8 border border-indigo-100 dark:border-indigo-800/50">
                        <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" /> General Tips
                        </h2>
                        <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
                            {[
                                "Use a soft, flexible measuring tape for all measurements",
                                "Ask someone to help you measure for best accuracy",
                                "Stand naturally — don't hold your breath or slouch",
                                "Take measurements over light, thin clothing",
                                "Measure twice to confirm accuracy",
                            ].map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Guides Grid */}
            <section className="py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {guides.map((guide, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{guide.title}</h3>
                                <div className="mb-4">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Key Measurements</p>
                                    <div className="flex flex-wrap gap-2">
                                        {guide.measurements.map((m, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                    💡 {guide.tips}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
                        <h2 className="text-2xl font-bold mb-3">Ready to get your perfect fit?</h2>
                        <p className="text-indigo-100 mb-6 max-w-lg mx-auto">Sign up and let our AI guide you through the measurement process.</p>
                        <Link href="/auth/user/register">
                            <button className="bg-white text-indigo-600 hover:bg-indigo-50 h-12 px-8 rounded-lg font-semibold shadow-lg transition-colors">
                                Get Started Free
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
