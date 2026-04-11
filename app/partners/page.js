import { Handshake, ArrowRight, Store, Scissors, Truck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Partners - Style Genie",
    description: "Partner with Style Genie. Join our network of tailors, shops, and delivery partners.",
};

export default function PartnersPage() {
    const partnerTypes = [
        {
            icon: Scissors,
            title: "Tailors",
            desc: "Join our network of expert tailors. Get consistent work flow, fair pricing, and grow your clientele with AI-matched orders.",
            href: "/auth/tailor/register",
            cta: "Apply as Tailor",
            color: "purple"
        },
        {
            icon: Store,
            title: "Shopkeepers",
            desc: "List your products on our platform and reach thousands of customers looking for quality fabrics and fashion.",
            href: "/auth/shopkeeper/register",
            cta: "Open Your Shop",
            color: "amber"
        },
        {
            icon: Truck,
            title: "Delivery Partners",
            desc: "Join our delivery fleet. Flexible hours, competitive pay, and the satisfaction of delivering joy to customers.",
            href: "/auth/delivery/register",
            cta: "Start Delivering",
            color: "emerald"
        },
    ];

    const benefits = [
        "AI-powered order matching",
        "Competitive commission rates",
        "Dedicated partner support",
        "Flexible working hours",
        "Rating-based growth system",
        "Weekly secure payments",
    ];

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero */}
            <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
                    <Handshake className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Partner with Style Genie</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Join our growing ecosystem of tailors, shops, and delivery partners. Together, we're revolutionizing custom fashion.
                    </p>
                </div>
            </section>

            {/* Partner Types */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {partnerTypes.map((partner, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${partner.color === "purple" ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" : partner.color === "amber" ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"}`}>
                                    <partner.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{partner.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{partner.desc}</p>
                                <Link href={partner.href}>
                                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90">
                                        {partner.cta} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                        <Sparkles className="h-4 w-4" />
                        Partner Benefits
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10">Why Partners Love Us</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-left">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 lg:py-20">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
                        <h2 className="text-2xl lg:text-3xl font-bold mb-3">Ready to grow with us?</h2>
                        <p className="text-indigo-100 mb-6 max-w-lg mx-auto">Join hundreds of partners already earning on our platform.</p>
                        <Link href="/contact">
                            <button className="bg-white text-indigo-600 hover:bg-indigo-50 h-12 px-8 rounded-lg font-semibold shadow-lg transition-colors">
                                Get in Touch
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
