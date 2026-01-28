import Link from "next/link";
import { User, Scissors, Store, Truck, ArrowRight } from "lucide-react";

export default function TermsOfService() {
    const roles = [
        {
            title: "Customer Terms",
            description: "For users shopping and requesting tailoring services.",
            href: "/legal/terms/customer",
            icon: User,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Tailor Agreement",
            description: "For professional tailors offering services on the platform.",
            href: "/legal/terms/tailor",
            icon: Scissors,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Shopkeeper Policy",
            description: "For shop owners selling fabrics and readymade items.",
            href: "/legal/terms/shopkeeper",
            icon: Store,
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            title: "Delivery Partner Terms",
            description: "For delivery agents managing logistics.",
            href: "/legal/terms/delivery",
            icon: Truck,
            color: "text-green-600",
            bgColor: "bg-green-50"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Please review the terms and conditions specific to your role on StyleGenie.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <Link href={role.href} key={role.href} className="group block">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${role.bgColor} ${role.color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                {role.title}
                                                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gray-400" />
                                            </h2>
                                            <p className="text-gray-500">{role.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">General Terms</h2>
                    <div className="space-y-4 text-gray-600">
                        <p>
                            <strong>Acceptance of Terms:</strong> By accessing StyleGenie, you agree to be bound by these terms.
                        </p>
                        <p>
                            <strong>Privacy Policy:</strong> Your use of the service is also governed by our Privacy Policy.
                        </p>
                        <p>
                            <strong>Changes to Terms:</strong> We may update these terms from time to time. Continued use of the service implies acceptance of the new terms.
                        </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-400">
                        Last updated: January 2026
                    </div>
                </div>
            </div>
        </div>
    );
}

