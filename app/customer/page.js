import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User, Sparkles, Ruler, Heart, ShoppingCart, CheckCircle } from "lucide-react";

export default function CustomerLandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 text-white overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 z-0 opacity-20">
                    <Image
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop"
                        alt="Fashion Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/80 to-transparent" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Sparkles className="h-12 w-12 text-blue-200" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Your Perfect Fit, <span className="text-blue-300">Powered by AI</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                            Get custom-tailored clothing that fits perfectly. Shop from local boutiques, designed by AI, and crafted by expert tailors—delivered to your door.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/user/register">
                                <Button size="lg" className="w-full sm:w-auto text-base h-14 px-10 bg-white text-blue-900 hover:bg-blue-50 shadow-xl">
                                    Start Shopping
                                </Button>
                            </Link>
                            <Link href="/auth/user/login">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-10 border-blue-400 text-white hover:bg-blue-800/50 hover:text-white">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Experience fashion tailored just for you</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Ruler,
                                title: "Perfect Fit Guaranteed",
                                desc: "AI-powered measurements ensure your clothes fit perfectly. No more ill-fitting off-the-rack purchases.",
                                color: "text-blue-600 bg-blue-100"
                            },
                            {
                                icon: Sparkles,
                                title: "AI Style Advisor",
                                desc: "Get personalized outfit recommendations based on your preferences, body type, and latest trends.",
                                color: "text-purple-600 bg-purple-100"
                            },
                            {
                                icon: Heart,
                                title: "Quality Craftsmanship",
                                desc: "Work with verified expert tailors who bring decades of experience to every stitch.",
                                color: "text-pink-600 bg-pink-100"
                            },
                            {
                                icon: ShoppingCart,
                                title: "Shop Local Boutiques",
                                desc: "Browse curated collections from local fashion shops. Support small businesses while looking great.",
                                color: "text-orange-600 bg-orange-100"
                            },
                            {
                                icon: CheckCircle,
                                title: "Easy Returns",
                                desc: "Not satisfied? We offer hassle-free returns and alterations to ensure you're completely happy.",
                                color: "text-green-600 bg-green-100"
                            },
                            {
                                icon: User,
                                title: "Doorstep Delivery",
                                desc: "Relax while we handle everything. Your custom outfit arrives at your door, ready to wear.",
                                color: "text-indigo-600 bg-indigo-100"
                            }
                        ].map((benefit, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                                <div className={`h-14 w-14 ${benefit.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <benefit.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Three simple steps to your perfect outfit</p>
                    </div>

                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "Browse & Design", desc: "Explore our catalog, get AI style suggestions, and customize your perfect outfit." },
                            { step: "2", title: "Expert Tailoring", desc: "Your measurements are sent to verified tailors who craft your garment with precision." },
                            { step: "3", title: "Delivered to You", desc: "Receive your custom-made clothing at your doorstep, ready to wear and impress." }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto shadow-lg">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Upgrade Your Wardrobe?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who discovered the joy of perfectly fitted clothing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/user/register">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 text-lg font-semibold shadow-lg">
                                Create Free Account
                            </Button>
                        </Link>
                        <Link href="/auth/user/login">
                            <Button size="lg" variant="outline" className="border-blue-400 text-white hover:bg-blue-700 h-14 px-10 text-lg">
                                Already a Member? Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
