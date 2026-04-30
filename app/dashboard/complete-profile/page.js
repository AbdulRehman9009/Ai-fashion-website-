"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import UserProfileForm from "@/components/profile-forms/UserProfileForm";
import TailorProfileForm from "@/components/profile-forms/TailorProfileForm";
import ShopkeeperProfileForm from "@/components/profile-forms/ShopkeeperProfileForm";
import DeliveryProfileForm from "@/components/profile-forms/DeliveryProfileForm";
import ProgressIndicator from "@/components/ui/ProgressIndicator";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Loader2, CheckCircle2, AlertCircle, Info, ChevronRight } from "lucide-react";

// Human-readable field labels
const FIELD_LABELS = {
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    "tailorProfile.phone": "Phone Number",
    "tailorProfile.cnicId": "CNIC / ID Number",
    "tailorProfile.experience": "Years of Experience",
    "tailorProfile.location.address": "Business Address",
    "tailorProfile.location.city": "City",
    "tailorProfile.specialization": "Specializations (select at least one)",
    "tailorProfile.pricePerJob": "Price Per Job",
    "tailorProfile.commissionPercentage": "Commission Percentage",
    "tailorProfile.agreedToTerms": "Terms & Conditions Agreement",
    "tailorProfile.pricePerJob or tailorProfile.commissionPercentage": "Pricing (fixed rate or commission)",
    "businessDetails.ownerName": "Business Owner Name",
    "businessDetails.phone": "Business Phone Number",
    "location.address": "Shop Address",
    "location.city": "Shop City",
    "commissionAgreement.agreedToTerms": "Commission Agreement",
    "deliveryProfile.fullName": "Full Name",
    "deliveryProfile.phone": "Phone Number",
    "deliveryProfile.cnicId": "CNIC / ID Number",
    "deliveryProfile.vehicleType": "Vehicle Type",
    "deliveryProfile.licenseNumber": "Driver's License Number",
    "deliveryProfile.serviceAreas": "Service Areas",
    "deliveryProfile.agreedToTerms": "Terms & Conditions Agreement",
    "addresses.0.street": "Street Address",
    "addresses.0.city": "City",
    "addresses.0.state": "State/Province",
    "payoutMethod.bankDetails.accountNumber": "Bank Account Number (for payouts)",
};

function getHumanLabel(field) {
    return FIELD_LABELS[field] || field.split(".").pop().replace(/([A-Z])/g, " $1").trim();
}

export default function CompleteProfilePage() {
    const { data: session, status, update } = useSession();
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

            // If profile is complete, update session and redirect
            if (response.data.isComplete) {
                await update({ isProfileComplete: true });
                const role = session.user.role.toLowerCase();
                window.location.href = `/dashboard/${role}`;
            }
        } catch (error) {
            console.error("Error checking profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        await update({ isProfileComplete: true });
        const role = session.user.role.toLowerCase();
        window.location.href = `/dashboard/${role}`;
    };

    if (status === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-300">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        router.push("/auth/user/login");
        return null;
    }

    const roleColorMap = {
        USER: { gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", darkBg: "bg-blue-900", darkText: "text-blue-100", darkBorder: "border-blue-800" },
        TAILOR: { gradient: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", darkBg: "bg-purple-900", darkText: "text-purple-100", darkBorder: "border-purple-800" },
        SHOPKEEPER: { gradient: "from-orange-500 to-orange-600", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", darkBg: "bg-orange-900", darkText: "text-orange-100", darkBorder: "border-orange-800" },
        DELIVERY: { gradient: "from-green-500 to-green-600", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", darkBg: "bg-green-900", darkText: "text-green-100", darkBorder: "border-green-800" },
        ADMIN: { gradient: "from-red-600 to-red-700", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", darkBg: "bg-red-900", darkText: "text-red-100", darkBorder: "border-red-800" },
    };

    const roleNames = {
        USER: "Customer",
        TAILOR: "Tailor",
        SHOPKEEPER: "Shopkeeper",
        DELIVERY: "Delivery Partner",
        ADMIN: "Administrator"
    };

    const colors = roleColorMap[session.user.role] || roleColorMap.USER;
    const roleName = roleNames[session.user.role] || session.user.role;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className={`bg-gradient-to-r ${colors.gradient} py-8 shadow-lg`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Info className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Complete Your {roleName} Profile</h1>
                        </div>
                        <div>
                            <ThemeToggle />
                        </div>
                    </div>
                    <p className="text-white/90 max-w-2xl">
                        Please fill in all required information to start using the platform. Your data is secure and will only be used for order processing.
                    </p>
                </div>
            </header>

            {/* Progress Section */}
            {profileStatus && !profileStatus.isComplete && (
                <div className="border-b bg-white py-6 shadow-sm dark:bg-gray-900 dark:shadow-none">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Completion Required</h2>
                                </div>

                                {profileStatus.missingFields && profileStatus.missingFields.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">Please complete the following fields:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profileStatus.missingFields.slice(0, 5).map((field, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border dark:${colors.darkBg} dark:${colors.darkText} dark:${colors.darkBorder}`}
                                                >
                                                    <ChevronRight className="h-3 w-3" />
                                                    {getHumanLabel(field)}
                                                </span>
                                            ))}
                                            {profileStatus.missingFields.length > 5 && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                    +{profileStatus.missingFields.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profileStatus.percentage}%</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-300">Complete</p>
                                    </div>
                                <ProgressIndicator
                                    percentage={profileStatus.percentage}
                                    size="md"
                                    variant="circular"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Section */}
            <div className="container mx-auto px-4 py-12">
                    <div className="mx-auto max-w-4xl">
                    <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                        {/* Role-specific hint */}
                        <div className={`mb-6 p-4 rounded-lg ${colors.bg} ${colors.border} border dark:${colors.darkBg} dark:${colors.darkBorder}`}>
                            <p className={`text-sm ${colors.text} dark:${colors.darkText}`}>
                                {session.user.role === "USER" && "💡 Add your measurements for better outfit recommendations from our AI stylist!"}
                                {session.user.role === "TAILOR" && "✂️ Complete your profile to start receiving tailoring orders from customers."}
                                {session.user.role === "SHOPKEEPER" && "🏪 Set up your shop details to start selling products on the platform."}
                                {session.user.role === "DELIVERY" && "🚚 Add your vehicle and service area details to start delivering orders."}
                                {session.user.role === "ADMIN" && "🔒 Admin accounts have full access to the platform."}
                            </p>
                        </div>

                        {session.user.role === "USER" && <UserProfileForm onComplete={handleComplete} />}
                        {session.user.role === "TAILOR" && <TailorProfileForm onComplete={handleComplete} />}
                        {session.user.role === "SHOPKEEPER" && <ShopkeeperProfileForm onComplete={handleComplete} />}
                        {session.user.role === "DELIVERY" && <DeliveryProfileForm onComplete={handleComplete} />}
                        {session.user.role === "ADMIN" && (
                            <div className="text-center py-8">
                                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Admin Access Granted</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">Your administrator profile is already set up.</p>
                                <button
                                    onClick={handleComplete}
                                    className="mt-6 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-8 py-3 text-white font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Go to Admin Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

