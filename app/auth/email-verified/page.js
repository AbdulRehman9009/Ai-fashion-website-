import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailVerifiedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Email Verified!
                    </h1>

                    <p className="text-gray-600 mb-6">
                        Your email has been successfully verified. You can now access all features of your account.
                    </p>

                    <Link href="/auth/user/login">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                            Continue to Login
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
