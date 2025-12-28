"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function ShopkeeperProfileForm({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const categories = ["Saree", "Lehenga", "Suit", "Kurti", "Dupatta", "Accessories"];

    const handleStripeOnboarding = async () => {
        setStripeLoading(true);
        try {
            const response = await axios.post("/api/stripe/connect/onboard", {
                returnUrl: `${window.location.origin}/dashboard/shopkeeper/settings?stripe=success`,
                refreshUrl: `${window.location.origin}/dashboard/shopkeeper/settings?stripe=refresh`,
            });

            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error("Error initiating Stripe onboarding:", error);
            toast.error("Failed to initiate payment setup");
            setStripeLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const profileData = {
                businessName: data.businessName,
                ownerName: data.ownerName,
                phone: data.phone,
                address: data.address,
                city: data.city,
                taxId: data.taxId,
                categoryPermissions: data.categoryPermissions ? data.categoryPermissions.split(",").map(c => c.trim()) : [],
                agreedToTerms: data.agreedToTerms,
            };

            const response = await axios.post("/api/profile/shopkeeper", profileData);

            if (response.data.success) {
                toast.success("Shop profile saved! Please complete Stripe onboarding.");
                if (!response.data.stripeAccountId) {
                    await handleStripeOnboarding();
                } else if (onComplete) {
                    onComplete();
                }
            }
        } catch (error) {
            console.error("Error submitting profile:", error);
            toast.error(error.response?.data?.error || "Failed to submit profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                        id="businessName"
                        {...register("businessName", { required: "Business name is required" })}
                        placeholder="Fashion Boutique"
                    />
                    {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>}
                </div>

                <div>
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                        id="ownerName"
                        {...register("ownerName", { required: "Owner name is required" })}
                        placeholder="John Doe"
                    />
                    {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                        id="phone"
                        {...register("phone", { required: "Phone number is required" })}
                        placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                        id="city"
                        {...register("city", { required: "City is required" })}
                        placeholder="New York"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="address">Business Address *</Label>
                <Input
                    id="address"
                    {...register("address", { required: "Address is required" })}
                    placeholder="123 Fashion Ave"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div>
                <Label htmlFor="categoryPermissions">Product Categories * (comma-separated)</Label>
                <Input
                    id="categoryPermissions"
                    {...register("categoryPermissions", { required: "At least one category required" })}
                    placeholder="Saree, Lehenga, Kurti"
                />
                <p className="mt-1 text-xs text-gray-500">Available: {categories.join(", ")}</p>
                {errors.categoryPermissions && <p className="mt-1 text-sm text-red-600">{errors.categoryPermissions.message}</p>}
            </div>

            <div>
                <Label htmlFor="taxId">Tax ID (Optional)</Label>
                <Input
                    id="taxId"
                    {...register("taxId")}
                    placeholder="12-3456789"
                />
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h4 className="mb-2 font-medium text-orange-900">Commission Agreement</h4>
                <p className="text-sm text-orange-700">
                    Platform commission: 10% of each sale. This is deducted automatically when payments are distributed.
                </p>
            </div>

            <div className="flex items-start">
                <input
                    type="checkbox"
                    id="agreedToTerms"
                    {...register("agreedToTerms", { required: "You must agree to the terms" })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the <a href="/terms" className="text-orange-600 hover:underline">Shopkeeper Agreement</a> and commission structure *
                </label>
            </div>
            {errors.agreedToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms.message}</p>}

            <div className="flex gap-3">
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600"
                    disabled={loading || stripeLoading}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Shop Profile
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleStripeOnboarding}
                    disabled={loading || stripeLoading}
                    className="flex-1"
                >
                    {stripeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Setup Payments (Stripe)
                </Button>
            </div>
        </form>
    );
}
