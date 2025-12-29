import { Building, Users, Globe, Award } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Redefining Fashion with AI</h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                        Connecting you with expert tailors and AI-powered style recommendations for the perfect fit, every time.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We believe that everyone deserves clothes that fit perfectly and express their unique style.
                            By bridging the gap between traditional craftsmanship and modern AI technology, we are
                            democratizing custom fashion.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Our platform empowers local tailors by connecting them with a broader audience, while
                            providing customers with a seamless, personalized shopping experience.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square rounded-2xl bg-gray-100 relative overflow-hidden">
                            {/* Replace with actual image in prod */}
                            <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-blue-300">Image 1</div>
                        </div>
                        <div className="aspect-square rounded-2xl bg-gray-100 relative overflow-hidden mt-8">
                            <div className="absolute inset-0 bg-purple-100 flex items-center justify-center text-purple-300">Image 2</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Users, label: "Happy Customers", value: "10,000+" },
                            { icon: Globe, label: "Cities Covered", value: "50+" },
                            { icon: Building, label: "Expert Tailors", value: "500+" },
                            { icon: Award, label: "Designs Created", value: "1M+" },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <stat.icon className="h-8 w-8 mx-auto text-blue-600 mb-4" />
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-gray-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
