"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                {/* Error Icon */}
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>

                {/* Error Message */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Something went wrong!</h1>
                    <p className="text-gray-600">
                        We encountered an unexpected error. Please try again or return to the homepage.
                    </p>
                </div>

                {/* Error Details (Dev Only) */}
                {process.env.NODE_ENV === "development" && error?.message && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                        <p className="text-sm font-mono text-red-700 break-words">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
