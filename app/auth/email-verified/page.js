import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailVerifiedPage() {
    return (
        <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Email Verified!
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your email has been successfully verified. You can now access all features of your account.
                </p>

                <Link href="/auth/user/login">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                        Continue to Login
                    </Button>
                </Link>
            </div>
        </div>
    );
}
