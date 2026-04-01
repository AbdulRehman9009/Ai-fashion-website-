import { Wand2, Ruler, ShieldCheck, Truck, Clock, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
    const features = [
        {
            icon: Wand2,
            title: "AI-Powered Styling",
            description: "Our advanced AI analyzes your preferences to recommend outfits that match your unique style and body type.",
            color: "indigo"
        },
        {
            icon: Ruler,
            title: "Perfect Fit Guarantee",
            description: "Input your precise measurements once, and get custom-tailored clothes that fit like a glove, every time.",
            color: "purple"
        },
        {
            icon: ShieldCheck,
            title: "Trusted Tailors",
            description: "We vet every tailor on our platform to ensure high-quality craftsmanship and professional service.",
            color: "emerald"
        },
        {
            icon: Truck,
            title: "Doorstep Delivery",
            description: "Enjoy the convenience of pick-up and delivery right from your home. Track your order in real-time.",
            color: "blue"
        },
        {
            icon: Clock,
            title: "Fast Turnaround",
            description: "Select urgent delivery options for those last-minute events, without compromising on quality.",
            color: "amber"
        },
        {
            icon: Heart,
            title: "Sustainable Fashion",
            description: "Support local artisans and reduce waste with made-to-order clothing instead of mass production.",
            color: "rose"
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Hero Section */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
                        <Sparkles className="h-4 w-4" />
                        Platform Features
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Why Choose Style Genie?</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Experience the future of fashion with features designed to make custom tailoring effortless and accessible.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="pb-20 lg:pb-28">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group"
                            >
                                <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color === "indigo" ? "bg-indigo-100 text-indigo-600" :
                                        feature.color === "purple" ? "bg-purple-100 text-purple-600" :
                                            feature.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                                                feature.color === "blue" ? "bg-blue-100 text-blue-600" :
                                                    feature.color === "amber" ? "bg-amber-100 text-amber-600" :
                                                        "bg-rose-100 text-rose-600"
                                    }`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Experience the Future of Fashion?
                    </h2>
                    <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
                        Join thousands of satisfied customers who love their perfectly fitted custom clothes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/user/register">
                            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-base font-semibold shadow-lg">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 h-14 px-8 text-base">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

