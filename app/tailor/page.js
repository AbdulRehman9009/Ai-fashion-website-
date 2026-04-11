import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Scissors, Star, Clock, Award, DollarSign, TrendingUp } from "lucide-react";

export default function TailorLandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 z-0 opacity-20">
                    <Image
                        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2700&auto=format&fit=crop"
                        alt="Tailor Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-900/80 to-transparent" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Scissors className="h-12 w-12 text-purple-200" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Join Our Network of <span className="text-purple-300">Expert Tailors</span>
                        </h1>
                        <p className="text-lg md:text-xl text-purple-100 mb-8 leading-relaxed">
                            Transform your tailoring business with AI-powered order matching. Get consistent work, fair pricing, and grow your clientele with our modern platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/tailor/register">
                                <Button size="lg" className="w-full sm:w-auto text-base h-14 px-10 bg-white text-purple-900 hover:bg-purple-100 shadow-xl font-semibold border-2 border-transparent">
                                    Start Application
                                </Button>
                            </Link>
                            <Link href="/auth/tailor/login">
                                <Button size="lg" variant="ghost" className="w-full sm:w-auto text-base h-14 px-10 border-2 border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white dark:bg-slate-900 border-y border-transparent dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Join Our Platform?</h2>
                        <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Grow your business with steady orders and modern tools</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: DollarSign,
                                title: "Steady Income",
                                desc: "Receive consistent orders matched to your skills. Choose between per-job pricing or commission-based earnings.",
                                color: "text-green-600 bg-green-100"
                            },
                            {
                                icon: TrendingUp,
                                title: "Grow Your Business",
                                desc: "Build your reputation with our rating system. Get more orders as you deliver quality work.",
                                color: "text-purple-600 bg-purple-100"
                            },
                            {
                                icon: Clock,
                                title: "Flexible Schedule",
                                desc: "Control your workload. Accept orders when you're available and set your own working hours.",
                                color: "text-blue-600 bg-blue-100"
                            },
                            {
                                icon: Award,
                                title: "Professional Support",
                                desc: "Access our dedicated tailor support team. Get help with orders, payments, and platform features.",
                                color: "text-orange-600 bg-orange-100"
                            },
                            {
                                icon: Star,
                                title: "Quality Materials",
                                desc: "Work with premium fabrics selected by customers. Focus on craftsmanship while we handle logistics.",
                                color: "text-yellow-600 bg-yellow-100"
                            },
                            {
                                icon: Scissors,
                                title: "Modern Tools",
                                desc: "Use our mobile-friendly dashboard to manage orders, track earnings, and communicate with customers.",
                                color: "text-indigo-600 bg-indigo-100"
                            }
                        ].map((benefit, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-500/50 hover:shadow-lg transition-all">
                                <div className={`h-14 w-14 ${benefit.color.replace(' bg-', ' dark:bg-opacity-20 bg-')} rounded-xl flex items-center justify-center mb-6`}>
                                    <benefit.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gradient-to-br from-purple-50 dark:from-slate-900 to-indigo-50 dark:to-slate-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
                        <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Three simple steps to start earning</p>
                    </div>

                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "Create Profile", desc: "Complete your professional profile with experience, specializations, and pricing." },
                            { step: "2", title: "Get Matched", desc: "Our AI matches you with orders that fit your skills and availability." },
                            { step: "3", title: "Earn Money", desc: "Complete orders, receive ratings, and get paid weekly via bank transfer." }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto shadow-lg">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-gray-600 dark:text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Tailoring Career?</h2>
                    <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                        Join hundreds of professional tailors earning consistent income on our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/tailor/register">
                            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 h-14 px-10 text-lg font-bold shadow-lg border-2 border-transparent">
                                Apply Now
                            </Button>
                        </Link>
                        <Link href="/auth/tailor/login">
                            <Button size="lg" variant="ghost" className="border-2 border-white/30 text-white hover:bg-white/10 h-14 px-10 text-lg hover:text-white backdrop-blur-sm">
                                Existing Tailor? Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
