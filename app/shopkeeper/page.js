import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Store, ShoppingBag, BarChart3, Users, Zap, Shield } from "lucide-react";

export default function ShopkeeperLandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 text-white overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 z-0 opacity-20">
                    <Image
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop"
                        alt="Shop Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-orange-900/80 to-transparent" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Store className="h-12 w-12 text-orange-200" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Expand Your Fashion <span className="text-orange-300">Business Online</span>
                        </h1>
                        <p className="text-lg md:text-xl text-orange-100 mb-8 leading-relaxed">
                            Reach thousands of customers beyond your storefront. Manage inventory, track orders, and grow sales with our AI-powered platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/shopkeeper/register">
                                <Button size="lg" className="w-full sm:w-auto text-base h-14 px-10 bg-white text-orange-900 hover:bg-orange-50 shadow-xl">
                                    Register Your Shop
                                </Button>
                            </Link>
                            <Link href="/auth/shopkeeper/login">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-10 border-orange-400 text-white hover:bg-orange-800/50 hover:text-white">
                                    Shop Owner Login
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Partner With Us?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Take your fashion business to the next level</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Expand Your Reach",
                                desc: "Connect with customers across the region. No more relying only on foot traffic to your physical location.",
                                color: "text-blue-600 bg-blue-100"
                            },
                            {
                                icon: ShoppingBag,
                                title: "Easy Inventory Management",
                                desc: "Upload and manage your products with our simple dashboard. Update stock, prices, and descriptions in real-time.",
                                color: "text-orange-600 bg-orange-100"
                            },
                            {
                                icon: BarChart3,
                                title: "Sales Analytics",
                                desc: "Track your performance with detailed reports. Understand trends, bestsellers, and customer preferences.",
                                color: "text-green-600 bg-green-100"
                            },
                            {
                                icon: Zap,
                                title: "Fast Order Processing",
                                desc: "Receive instant notifications for new orders. Streamline fulfillment with integrated tailor coordination.",
                                color: "text-purple-600 bg-purple-100"
                            },
                            {
                                icon: Shield,
                                title: "Secure Payments",
                                desc: "Get paid on time with our secure payment system. Weekly automatic transfers to your bank account.",
                                color: "text-red-600 bg-red-100"
                            },
                            {
                                icon: Store,
                                title: "Your Brand, Amplified",
                                desc: "Showcase your shop with a beautiful profile. Build trust with ratings and customer reviews.",
                                color: "text-indigo-600 bg-indigo-100"
                            }
                        ].map((benefit, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
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
            <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started in Minutes</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Simple onboarding process for shop owners</p>
                    </div>

                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "Create Shop Profile", desc: "Register your business, upload your logo, and tell us about your fashion offerings." },
                            { step: "2", title: "List Products", desc: "Add your inventory with photos, descriptions, and pricing. We'll help customers find you." },
                            { step: "3", title: "Start Selling", desc: "Receive orders, coordinate with tailors, and watch your online revenue grow." }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto shadow-lg">
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
            <section className="py-24 bg-orange-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Digitalize Your Fashion Business?</h2>
                    <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
                        Join successful shop owners who are growing their revenue with our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/shopkeeper/register">
                            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 h-14 px-10 text-lg font-semibold shadow-lg">
                                Register Your Shop
                            </Button>
                        </Link>
                        <Link href="/auth/shopkeeper/login">
                            <Button size="lg" variant="outline" className="border-orange-400 text-white hover:bg-orange-700 h-14 px-10 text-lg">
                                Shop Owner? Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
