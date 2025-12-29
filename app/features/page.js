import { Wand2, Ruler, ShieldCheck, Truck, Clock, Heart } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: Wand2,
            title: "AI-Powered Styling",
            description: "Our advanced AI analyzes your preferences to recommend outfits that match your unique style and body type."
        },
        {
            icon: Ruler,
            title: "Perfect Fit Guarantee",
            description: "Input your precise measurements once, and get custom-tailored clothes that fit like a glove, every time."
        },
        {
            icon: ShieldCheck,
            title: "Trusted Tailors",
            description: "We vet every tailor on our platform to ensure high-quality craftsmanship and professional service."
        },
        {
            icon: Truck,
            title: "Doorstep Delivery",
            description: "Enjoy the convenience of pick-up and delivery right from your home. Track your order in real-time."
        },
        {
            icon: Clock,
            title: "Fast Turnaround",
            description: "Select urgent delivery options for those last-minute events, without compromising on quality."
        },
        {
            icon: Heart,
            title: "Sustainable Fashion",
            description: "Support local artisans and reduce waste with made-to-order clothing instead of mass production."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-20">
            <div className="container mx-auto px-4 text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Experience the future of fashion with features designed to make custom tailoring effortless and accessible.
                </p>
            </div>

            <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                            <feature.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
