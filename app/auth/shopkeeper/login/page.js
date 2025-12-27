"use client";
import AuthForm from "@/components/auth/AuthForm";

export default function ShopkeeperLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50/30 p-4">
      <AuthForm role="SHOPKEEPER" type="login" />
    </div>
  );
}
