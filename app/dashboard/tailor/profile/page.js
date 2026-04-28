"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TailorProfileForm from "@/components/profile-forms/TailorProfileForm";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function TailorProfilePage() {
    const searchParams = useSearchParams();
    const isRequired = searchParams.get("required") === "true";
    const [profileStatus, setProfileStatus] = useState(null);

    useEffect(() => {
        fetchProfileStatus();
    }, []);

    const fetchProfileStatus = async () => {
        try {
            const res = await fetch("/api/profile/completion");
            if (res.ok) {
                const data = await res.json();
                setProfileStatus(data);
            }
        } catch (error) {
            console.error("Error fetching profile status:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <ThemeToggle />
            </div>
            {isRequired && profileStatus && !profileStatus.isComplete && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profile Incomplete</AlertTitle>
                    <AlertDescription>
                        You must complete your profile ({profileStatus.percentage}% complete) before you can
                        accept tailoring assignments.
                    </AlertDescription>
                </Alert>
            )}

            {profileStatus && profileStatus.isComplete && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Profile Complete</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Your profile is 100% complete. You can now accept orders!
                    </AlertDescription>
                </Alert>
            )}

            <TailorProfileForm onComplete={fetchProfileStatus} />
        </div>
    );
}
