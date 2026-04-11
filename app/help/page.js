import { HelpCircle, MessageCircle, FileText, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Help Center - Style Genie",
    description: "Find answers to common questions about Style Genie's AI-powered fashion platform.",
};

export default function HelpPage() {
    const faqs = [
        {
            question: "How does AI styling work?",
            answer: "Our AI analyzes your preferences, body type, and occasion to recommend outfits tailored specifically to you. Upload a photo and get personalized suggestions instantly."
        },
        {
            question: "How do I take accurate measurements?",
            answer: "Visit our Measurement Guides page for step-by-step instructions. You can also use our AI measurement tool for automated suggestions."
        },
        {
            question: "What is the return policy?",
            answer: "We offer a satisfaction guarantee. If your garment doesn't fit perfectly, we'll arrange free alterations or a full refund within 30 days."
        },
        {
            question: "How long does tailoring take?",
            answer: "Standard orders are completed within 5-7 business days. Urgent options are available for 2-3 day turnaround at an additional fee."
        },
        {
            question: "How do I become a tailor on the platform?",
            answer: "Visit our Tailor registration page, complete your profile with your experience and specializations, and our team will review your application within 48 hours."
        },
        {
            question: "Is my payment information secure?",
            answer: "Yes, all payments are processed through secure, PCI-compliant payment providers. We never store your card details directly."
        },
    ];

    const categories = [
        { icon: MessageCircle, title: "Getting Started", desc: "New to Style Genie? Learn the basics.", href: "/features", color: "indigo" },
        { icon: FileText, title: "Measurement Guides", desc: "How to measure for the perfect fit.", href: "/guides", color: "purple" },
        { icon: Mail, title: "Contact Support", desc: "Can't find your answer? Reach out.", href: "/contact", color: "emerald" },
    ];

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero */}
            <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent" />
                <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Help Center</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Find answers to common questions or get in touch with our support team.
                    </p>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {categories.map((cat, idx) => (
                            <Link key={idx} href={cat.href} className="group">
                                <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${cat.color === "indigo" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : cat.color === "purple" ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"}`}>
                                        <cat.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cat.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{cat.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-start gap-2">
                                    <ChevronRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                                    {faq.question}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-7">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
                        <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
                        <p className="text-indigo-100 mb-6 max-w-lg mx-auto">Our support team is available Monday through Friday, 9 AM to 6 PM EST.</p>
                        <Link href="/contact">
                            <button className="bg-white text-indigo-600 hover:bg-indigo-50 h-12 px-8 rounded-lg font-semibold shadow-lg transition-colors">
                                Contact Support
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
