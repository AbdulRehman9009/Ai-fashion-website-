"use client";
import ShopkeeperProfileForm from "@/components/profile-forms/ShopkeeperProfileForm";

export default function ShopkeeperSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Shop Settings</h2>
                <p className="text-muted-foreground">
                    Manage your shop profile and business information
                </p>
            </div>

            <ShopkeeperProfileForm />
        </div>
    );
}
