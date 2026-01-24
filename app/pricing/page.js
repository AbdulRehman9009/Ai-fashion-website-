import Link from "next/link";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            icon: Sparkles,
            description: "Perfect for trying out our AI styling",
            price: "0",
            period: "forever",
            color: "slate",
            features: [
                "3 AI outfit recommendations/month",
                "Basic style suggestions",
                "Browse tailor directory",
                "Standard support",
            ],
            cta: "Get Started",
            href: "/auth/user/register",
            popular: false
        },
        {
            name: "Premium",
            icon: Zap,
            description: "Best for regular fashion enthusiasts",
            price: "19",
            period: "/month",
            color: "indigo",
            features: [
                "Unlimited AI recommendations",
                "Priority tailor matching",
                "Personalized color analysis",
                "Wardrobe management",
                "Style history & preferences",
                "Exclusive discounts",
                "Priority support",
            ],
            cta: "Start Free Trial",
            href: "/auth/user/register?plan=premium",
            popular: true
        },
        {
            name: "Enterprise",
            icon: Crown,
            description: "For businesses and fashion brands",
            price: "99",
            period: "/month",
            color: "purple",
            features: [
                "Everything in Premium",
                "Multiple team members",
                "Custom integrations",
                "Bulk order discounts",
                "Dedicated account manager",
                "Analytics dashboard",
                "White-label options",
                "SLA guarantee",
            ],
            cta: "Contact Sales",
            href: "/contact?type=enterprise",
            popular: false
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Header */}
            <div className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                        <Sparkles className="h-4 w-4" />
                        Simple, Transparent Pricing
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                        Find the Perfect Plan
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Start for free and upgrade as you grow. All plans include access to our AI styling technology.
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="container mx-auto px-4 sm:px-6 pb-20 lg:pb-28">
                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 ${plan.popular
                                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-xl shadow-indigo-200 scale-105 lg:scale-110 z-10"
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-sm font-semibold shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2.5 rounded-xl ${plan.popular
                                        ? "bg-white/20"
                                        : plan.color === "slate"
                                            ? "bg-slate-100 text-slate-600"
                                            : plan.color === "purple"
                                                ? "bg-purple-100 text-purple-600"
                                                : "bg-indigo-100 text-indigo-600"
                                    }`}>
                                    <plan.icon className="h-6 w-6" />
                                </div>
                                <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                                    {plan.name}
                                </h3>
                            </div>

                            <p className={`text-sm mb-6 ${plan.popular ? "text-indigo-100" : "text-slate-600"}`}>
                                {plan.description}
                            </p>

                            <div className="mb-6">
                                <span className={`text-4xl lg:text-5xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                                    ${plan.price}
                                </span>
                                <span className={`text-sm ${plan.popular ? "text-indigo-200" : "text-slate-500"}`}>
                                    {plan.period}
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-indigo-200" : "text-indigo-500"
                                            }`} />
                                        <span className={`text-sm ${plan.popular ? "text-indigo-100" : "text-slate-600"}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={plan.href} className="block">
                                <Button
                                    size="lg"
                                    className={`w-full h-12 font-semibold ${plan.popular
                                            ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
                                            : plan.color === "purple"
                                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                                : "bg-slate-900 text-white hover:bg-slate-800"
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <div className="text-center mt-16 lg:mt-20">
                    <p className="text-slate-600 mb-4">
                        All plans include a 14-day money-back guarantee.
                    </p>
                    <p className="text-sm text-slate-500">
                        Questions? <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">Contact our team</Link> for help.
                    </p>
                </div>
            </div>
        </main>
    );
}
