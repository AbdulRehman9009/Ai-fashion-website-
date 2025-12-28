"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import CustomerProfileForm from "@/components/profile/CustomerProfileForm";
import TailorProfileForm from "@/components/profile/TailorProfileForm";
import ShopkeeperProfileForm from "@/components/profile/ShopkeeperProfileForm";
import DeliveryProfileForm from "@/components/profile/DeliveryProfileForm";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function CompleteProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profileStatus, setProfileStatus] = useState(null);

    useEffect(() => {
        if (status === "authenticated") {
            checkProfileCompletion();
        }
    }, [status]);

    const checkProfileCompletion = async () => {
        try {
            const response = await axios.get("/api/profile/completion");
            setProfileStatus(response.data);

            // If profile is complete, redirect to dashboard
            if (response.data.isComplete) {
                const role = session.user.role.toLowerCase();
                router.push(`/dashboard/${role}`);
            }
        } catch (error) {
            console.error("Error checking profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        const role = session.user.role.toLowerCase();
        router.push(`/dashboard/${role}`);
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!session) {
        router.push("/auth/user/login");
        return null;
    }

    const roleColorMap = {
        USER: "from-blue-500 to-blue-600",
        TAILOR: "from-purple-500 to-purple-600",
        SHOPKEEPER: "from-orange-500 to-orange-600",
        DELIVERY: "from-green-500 to-green-600",
        ADMIN: "from-red-600 to-red-700",
    };

    const colorClass = roleColorMap[session.user.role] || "from-gray-600 to-gray-700";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className={`bg-gradient-to-r ${colorClass} py-8 shadow-lg`}>
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
                    <p className="mt-2 text-white/90">
                        Please fill in all required information to start using the platform
                    </p>
                </div>
            </header>

            {/* Progress Section */}
            {profileStatus && !profileStatus.isComplete && (
                <div className="border-b bg-white py-6 shadow-sm">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
                                {profileStatus.missingFields && profileStatus.missingFields.length > 0 && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        Missing: {profileStatus.missingFields.join(", ")}
                                    </p>
                                )}
                            </div>
                            <ProgressIndicator
                                percentage={profileStatus.percentage}
                                size="md"
                                variant="circular"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Form Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-xl border bg-white p-8 shadow-lg">
                        {session.user.role === "USER" && <CustomerProfileForm onComplete={handleComplete} />}
                        {session.user.role === "TAILOR" && <TailorProfileForm onComplete={handleComplete} />}
                        {session.user.role === "SHOPKEEPER" && <ShopkeeperProfileForm onComplete={handleComplete} />}
                        {session.user.role === "DELIVERY" && <DeliveryProfileForm onComplete={handleComplete} />}
                        {session.user.role === "ADMIN" && (
                            <div className="text-center">
                                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-900">Admin Access Granted</h3>
                                <p className="mt-2 text-gray-600">Your profile is already set up.</p>
                                <button
                                    onClick={handleComplete}
                                    className="mt-6 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-white hover:from-red-700 hover:to-red-800"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
