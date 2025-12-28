"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export default function CustomerProfileForm({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const profileData = {
                name: data.name,
                phone: data.phone,
                address: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    zip: data.zip,
                    country: data.country || "USA",
                    isDefault: true,
                },
                measurementPreference: data.measurementPreference,
                defaultPaymentMethod: data.defaultPaymentMethod,
                agreedToTerms: data.agreedToTerms,
            };

            const response = await axios.post("/api/profile/customer", profileData);

            if (response.data.success) {
                toast.success("Profile completed successfully!");
                if (onComplete) onComplete();
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
                <Label htmlFor="street">Shipping Address *</Label>
                <Input
                    id="street"
                    {...register("street", { required: "Street address is required" })}
                    placeholder="123 Main St, Apt 4B"
                />
                {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                        id="city"
                        {...register("city", { required: "City is required" })}
                        placeholder="New York"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                </div>

                <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                        id="state"
                        {...register("state", { required: "State is required" })}
                        placeholder="NY"
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                </div>

                <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                        id="zip"
                        {...register("zip", { required: "ZIP code is required" })}
                        placeholder="10001"
                    />
                    {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <Label htmlFor="measurementPreference">Measurement Preference *</Label>
                    <select
                        id="measurementPreference"
                        {...register("measurementPreference", { required: "Please select a preference" })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        <option value="manual">Manual (I'll provide measurements)</option>
                        <option value="tailor">Tailor will measure</option>
                    </select>
                    {errors.measurementPreference && <p className="mt-1 text-sm text-red-600">{errors.measurementPreference.message}</p>}
                </div>

                <div>
                    <Label htmlFor="defaultPaymentMethod">Default Payment Method *</Label>
                    <select
                        id="defaultPaymentMethod"
                        {...register("defaultPaymentMethod", { required: "Please select a payment method" })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="paypal">PayPal</option>
                    </select>
                    {errors.defaultPaymentMethod && <p className="mt-1 text-sm text-red-600">{errors.defaultPaymentMethod.message}</p>}
                </div>
            </div>

            <div className="flex items-start">
                <input
                    type="checkbox"
                    id="agreedToTerms"
                    {...register("agreedToTerms", { required: "You must agree to the terms" })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-700">
                    I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</a> and <a href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</a> *
                </label>
            </div>
            {errors.agreedToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms.message}</p>}

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Profile
            </Button>
        </form>
    );
}
