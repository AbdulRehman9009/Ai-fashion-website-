import { Building, Users, Globe, Award, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/30 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>
                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm mb-6">
                        <Sparkles className="h-4 w-4" />
                        Our Story
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Redefining Fashion with AI</h1>
                    <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto">
                        Connecting you with expert tailors and AI-powered style recommendations for the perfect fit, every time.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Our Mission</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            We believe that everyone deserves clothes that fit perfectly and express their unique style.
                            By bridging the gap between traditional craftsmanship and modern AI technology, we are
                            democratizing custom fashion.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Our platform empowers local tailors by connecting them with a broader audience, while
                            providing customers with a seamless, personalized shopping experience.
                        </p>
                        <Link href="/auth/user/register">
                            <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 h-12 px-6 mt-4">
                                Join Us Today
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-4xl mb-2">✂️</div>
                                <div className="text-indigo-700 font-medium">Expert Tailors</div>
                            </div>
                        </div>
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mt-8">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🤖</div>
                                <div className="text-purple-700 font-medium">AI Styling</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                        {[
                            { icon: Users, label: "Happy Customers", value: "10,000+", color: "indigo" },
                            { icon: Globe, label: "Cities Covered", value: "50+", color: "purple" },
                            { icon: Building, label: "Expert Tailors", value: "500+", color: "emerald" },
                            { icon: Award, label: "Designs Created", value: "1M+", color: "amber" },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-md transition-shadow">
                                <stat.icon className={`h-8 w-8 mx-auto mb-4 ${stat.color === "indigo" ? "text-indigo-600" :
                                        stat.color === "purple" ? "text-purple-600" :
                                            stat.color === "emerald" ? "text-emerald-600" :
                                                "text-amber-600"
                                    }`} />
                                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-slate-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Transform Your Style?
                    </h2>
                    <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
                        Join thousands of satisfied customers and discover the joy of perfectly fitted custom clothing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/user/register">
                            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-base font-semibold shadow-lg">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/features">
                            <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 h-14 px-8 text-base">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

