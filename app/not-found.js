"use client";

import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* 404 Illustration */}
                <div className="relative">
                    <h1 className="text-[150px] sm:text-[200px] font-black text-gray-200 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 animate-pulse" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={() => typeof window !== "undefined" && window.history.back()}
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
