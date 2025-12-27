"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminResetPassword() {
    return (
        <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold text-red-900">Contact Support</h1>
            <p className="text-gray-500">
                Administrator password resets must be handled manually by the system super-admin or via direct database access for security.
            </p>
            <Link href="/auth/admin/login">
                <Button variant="outline">Back to Login</Button>
            </Link>
        </div>
    );
}
