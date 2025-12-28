"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function DeliveryProfileForm({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleStripeOnboarding = async () => {
        setStripeLoading(true);
        try {
            const response = await axios.post("/api/stripe/connect/onboard", {
                returnUrl: `${window.location.origin}/dashboard/delivery/settings?stripe=success`,
                refreshUrl: `${window.location.origin}/dashboard/delivery/settings?stripe=refresh`,
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
                fullName: data.fullName,
                phone: data.phone,
                cnicId: data.cnicId,
                vehicleType: data.vehicleType,
                licenseNumber: data.licenseNumber,
                serviceAreas: data.serviceAreas ? data.serviceAreas.split(",").map(s => s.trim()) : [],
                perDeliveryFee: parseFloat(data.perDeliveryFee),
                availability: data.availability === "true",
                agreedToTerms: data.agreedToTerms,
            };

            const response = await axios.post("/api/profile/delivery", profileData);

            if (response.data.success) {
                toast.success("Profile saved! Please complete Stripe onboarding.");
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
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                        id="fullName"
                        {...register("fullName", { required: "Full name is required" })}
                        placeholder="John Doe"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
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
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <select
                        id="vehicleType"
                        {...register("vehicleType", { required: "Vehicle type is required" })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        <option value="">Select Vehicle</option>
                        <option value="Bike">Bike</option>
                        <option value="Car">Car</option>
                        <option value="Van">Van</option>
                        <option value="Truck">Truck</option>
                    </select>
                    {errors.vehicleType && <p className="mt-1 text-sm text-red-600">{errors.vehicleType.message}</p>}
                </div>

                <div>
                    <Label htmlFor="licenseNumber">License Number *</Label>
                    <Input
                        id="licenseNumber"
                        {...register("licenseNumber", { required: "License number is required" })}
                        placeholder="DL-12345678"
                    />
                    {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="serviceAreas">Service Areas * (comma-separated cities)</Label>
                <Input
                    id="serviceAreas"
                    {...register("serviceAreas", { required: "At least one service area required" })}
                    placeholder="New York, Brooklyn, Queens"
                />
                {errors.serviceAreas && <p className="mt-1 text-sm text-red-600">{errors.serviceAreas.message}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <Label htmlFor="perDeliveryFee">Per Delivery Fee ($) *</Label>
                    <Input
                        id="perDeliveryFee"
                        type="number"
                        step="0.01"
                        {...register("perDeliveryFee", { required: "Delivery fee is required", min: 0 })}
                        placeholder="10.00"
                    />
                    {errors.perDeliveryFee && <p className="mt-1 text-sm text-red-600">{errors.perDeliveryFee.message}</p>}
                </div>

                <div>
                    <Label htmlFor="availability">Availability *</Label>
                    <select
                        id="availability"
                        {...register("availability", { required: "Please select availability" })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                    </select>
                </div>
            </div>

            <div className="flex items-start">
                <input
                    type="checkbox"
                    id="agreedToTerms"
                    {...register("agreedToTerms", { required: "You must agree to the terms" })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the <a href="/terms" className="text-green-600 hover:underline">Delivery Partner Agreement</a> and payment terms *
                </label>
            </div>
            {errors.agreedToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms.message}</p>}

            <div className="flex gap-3">
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
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
