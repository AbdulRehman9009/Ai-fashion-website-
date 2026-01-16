"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function TailorProfileForm({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const specializations = [
        "Formal Wear",
        "Wedding Attire",
        "Casual Wear",
        "Traditional Clothing",
        "Alterations",
        "Custom Suits",
    ];

    const handleStripeOnboarding = async () => {
        setStripeLoading(true);
        try {
            const response = await axios.post("/api/stripe/connect/onboard", {
                returnUrl: `${window.location.origin}/dashboard/tailor/settings?stripe=success`,
                refreshUrl: `${window.location.origin}/dashboard/tailor/settings?stripe=refresh`,
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
                name: data.name,
                phone: data.phone,
                cnicId: data.cnicId,
                address: data.address,
                city: data.city,
                specialization: data.specialization ? data.specialization.split(",") : [],
                experience: parseInt(data.experience),
                pricePerJob: data.pricePerJob ? parseFloat(data.pricePerJob) : null,
                commissionPercentage: data.commissionPercentage ? parseFloat(data.commissionPercentage) : null,
                availability: data.availability === "true",
                agreedToTerms: data.agreedToTerms,
            };

            const response = await axios.post("/api/profile/tailor", profileData);

            if (response.data.success) {
                toast.success("Profile saved! Please complete Stripe onboarding.");
                // Automatically trigger Stripe onboarding if not done
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
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                        id="name"
                        {...register("name", { required: "Full name is required" })}
                        placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                        id="phone"
                        {...register("phone", { required: "Phone number is required" })}
                        placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="cnicId">CNIC / ID Number *</Label>
                <Input
                    id="cnicId"
                    {...register("cnicId", { required: "ID number is required" })}
                    placeholder="12345-1234567-1"
                />
                {errors.cnicId && <p className="mt-1 text-sm text-red-600">{errors.cnicId.message}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                        id="address"
                        {...register("address", { required: "Address is required" })}
                        placeholder="123 Main St"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
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
                <Label htmlFor="specialization">Specializations * (comma-separated)</Label>
                <Input
                    id="specialization"
                    {...register("specialization", { required: "At least one specialization required" })}
                    placeholder="Formal Wear, Wedding Attire, Alterations"
                />
                <p className="mt-1 text-xs text-gray-500">Examples: {specializations.join(", ")}</p>
                {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div>
                    <Label htmlFor="experience">Experience (years) *</Label>
                    <Input
                        id="experience"
                        type="number"
                        {...register("experience", { required: "Experience is required", min: 0 })}
                        placeholder="5"
                    />
                    {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
                </div>

                <div>
                    <Label htmlFor="pricePerJob">Price per Job ($)</Label>
                    <Input
                        id="pricePerJob"
                        type="number"
                        step="0.01"
                        {...register("pricePerJob")}
                        placeholder="150.00"
                    />
                </div>

                <div>
                    <Label htmlFor="commissionPercentage">OR Commission (%)</Label>
                    <Input
                        id="commissionPercentage"
                        type="number"
                        step="0.1"
                        {...register("commissionPercentage")}
                        placeholder="15"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="availability">Availability *</Label>
                <select
                    id="availability"
                    {...register("availability", { required: "Please select availability" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                </select>
            </div>

            <div className="flex items-start">
                <input
                    type="checkbox"
                    id="agreedToTerms"
                    {...register("agreedToTerms", { required: "You must agree to the terms" })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the <a href="/terms" className="text-purple-600 hover:underline">Tailor Agreement</a> and platform commission structure *
                </label>
            </div>
            {errors.agreedToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms.message}</p>}

            <div className="flex gap-3">
                <Button
                    type="submit"
                    className="flex-1 bg-linear-to-r from-purple-500 to-purple-600"
                    disabled={loading || stripeLoading}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile
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
