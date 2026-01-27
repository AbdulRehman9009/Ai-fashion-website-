"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton({
    label = "Back",
    className = "",
    variant = "ghost",
    showIcon = true
}) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <Button
            variant={variant}
            onClick={handleBack}
            className={`gap-2 ${className}`}
        >
            {showIcon && <ArrowLeft className="h-4 w-4" />}
            {label}
        </Button>
    );
}
