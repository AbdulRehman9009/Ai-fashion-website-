import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Clock, DollarSign, TrendingUp, Award } from "lucide-react";

export default function DeliveryLandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 z-0 opacity-20">
                    <Image
                        src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=2665&auto=format&fit=crop"
                        alt="Delivery Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-900/80 to-transparent" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Truck className="h-12 w-12 text-green-200" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                            Deliver Fashion, <span className="text-green-300">Earn on Your Terms</span>
                        </h1>
                        <p className="text-lg md:text-xl text-green-100 mb-8 leading-relaxed">
                            Join our network of delivery partners. Set your own schedule, choose your service area, and earn competitive rates delivering premium fashion items.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/auth/delivery/register">
                                <Button size="lg" className="w-full sm:w-auto text-base h-14 px-10 bg-white text-green-900 hover:bg-green-50 shadow-xl">
                                    Become a Partner
                                </Button>
                            </Link>
                            <Link href="/auth/delivery/login">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-10 border-green-400 text-white hover:bg-green-800/50 hover:text-white">
                                    Partner Login
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Deliver With Us?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Flexible work with competitive earnings</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: DollarSign,
                                title: "Great Earnings",
                                desc: "Competitive per-delivery rates. Earn more with bonuses for on-time deliveries and customer ratings.",
                                color: "text-green-600 bg-green-100"
                            },
                            {
                                icon: Clock,
                                title: "Flexible Hours",
                                desc: "Work when you want. Accept deliveries that fit your schedule. No fixed shifts or minimum hours.",
                                color: "text-blue-600 bg-blue-100"
                            },
                            {
                                icon: MapPin,
                                title: "Choose Your Area",
                                desc: "Define your service zones. Deliver in neighborhoods you know, keeping routes efficient and familiar.",
                                color: "text-purple-600 bg-purple-100"
                            },
                            {
                                icon: TrendingUp,
                                title: "Weekly Payouts",
                                desc: "Get paid weekly via direct bank transfer. Track your earnings in real-time through our dashboard.",
                                color: "text-orange-600 bg-orange-100"
                            },
                            {
                                icon: Award,
                                title: "Rating System",
                                desc: "Build your reputation with customer ratings. Top-rated partners get priority access to deliveries.",
                                color: "text-yellow-600 bg-yellow-100"
                            },
                            {
                                icon: Truck,
                                title: "Use Any Vehicle",
                                desc: "Deliver with a bike, car, or van. We support all vehicle types to match your preferences.",
                                color: "text-indigo-600 bg-indigo-100"
                            }
                        ].map((benefit, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all">
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
            <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started is Easy</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Three steps to start earning</p>
                    </div>

                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
                        {[
                            { step: "1", title: "Sign Up", desc: "Complete your profile with vehicle info, service areas, and banking details for payouts." },
                            { step: "2", title: "Get Verified", desc: "Submit your license and ID for quick verification. Start accepting deliveries within 24 hours." },
                            { step: "3", title: "Start Delivering", desc: "Accept delivery requests via our app, pick up fashion items, and deliver to happy customers." }
                        ].map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto shadow-lg">
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
            <section className="py-24 bg-green-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Earning?</h2>
                    <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                        Join our growing network of delivery partners and start earning on your own schedule today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/delivery/register">
                            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 h-14 px-10 text-lg font-semibold shadow-lg">
                                Apply Now
                            </Button>
                        </Link>
                        <Link href="/auth/delivery/login">
                            <Button size="lg" variant="outline" className="border-green-400 text-white hover:bg-green-700 h-14 px-10 text-lg">
                                Existing Partner? Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
