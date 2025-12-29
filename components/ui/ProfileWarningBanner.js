"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ProfileWarningBanner() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Don't show on profile completion page or auth pages
    if (pathname.includes("/complete-profile") || pathname.includes("/auth")) {
        return null;
    }

    // If session doesn't exist or profile is complete, don't show
    if (!session?.user || session.user.profileCompletion?.isComplete) {
        return null;
    }

    // Also check the isProfileComplete boolean directly if set
    if (session.user.isProfileComplete) return null;

    return (
        <div className="bg-amber-50 border-b border-amber-200 p-4 sticky top-0 z-50">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full hidden sm:block">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-900">Complete Your Profile</h3>
                        <p className="text-sm text-amber-700">
                            You need to complete your profile to place orders and access all features.
                        </p>
                    </div>
                </div>
                <Link
                    href="/dashboard/complete-profile"
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
                >
                    Complete Now <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
